import {Injectable} from '@angular/core';
import {WebSocketSubject} from 'rxjs/internal-compatibility';
import * as kurentoUtils from 'kurento-utils';
import {Participant} from '../participant';

@Injectable({
  providedIn: 'root'
})
export class KurentoService {
  userId: number;

  private webRtcPeer: any;
  roomId: number;
  rootElement: HTMLElement;
  private readonly ws: WebSocketSubject<any>;
  private participants = {};

  constructor() {
    const wsUrl = `wss://mrc21-backend.herokuapp.com/ws`;
    console.log(wsUrl);
    this.ws = new WebSocketSubject(wsUrl);
  }

  start(userId: number, roomId: number, rootElement: HTMLElement): void {
    console.log('start');
    this.userId = userId;
    this.roomId = roomId;
    this.rootElement = rootElement;

    this.ws.subscribe(value => {
      this.handleMessage(value);
    });
    this.register();
  }

  handleMessage(message: any): void {
    console.log('handleMessage');

    switch (message.id) {
      case 'existingParticipants':
        this.onExistingParticipants(message);
        break;
      case 'newParticipantArrived':
        this.onNewParticipant(message);
        break;
      case 'participantLeft':
        this.onParticipantLeft(message);
        break;
      case 'receiveVideoAnswer':
        this.receiveVideoResponse(message);
        break;
      case 'iceCandidate':
        this.participants[message.userId].rtcPeer.addIceCandidate(message.candidate, error => {
          if (error) {
            console.error('Error adding candidate: ' + error);
            return;
          }
        });
        break;
      default:
        console.error('Unrecognized message', message);
    }
  }

  register(): void {
    console.log('register');
    const message = {
      id: 'joinRoom',
      userId: this.userId,
      roomId: this.roomId,
    };
    console.log(message);
    this.sendMessage(message);
  }

  onNewParticipant(request): void {
    console.log('onNewParticipant');
    this.receiveVideo(request.userId);
  }

  receiveVideoResponse(result): void {
    console.log('receiveVideoResponse');
    console.log(this.participants);
    console.log(result);
    this.participants[result.userId].rtcPeer.processAnswer(result.sdpAnswer, error => {
      if (error) {
        return console.error(error);
      }
    });
  }

  callResponse(message): void {
    console.log('callResponse');
    if (message.response !== 'accepted') {
      console.log('Call not accepted by peer. Closing call');
      stop();
    } else {
      this.webRtcPeer.processAnswer(message.sdpAnswer, (error) => {
        if (error) {
          return console.error(error);
        }
      });
    }
  }

  onExistingParticipants(msg): void {
    console.log('onExistingParticipants');
    console.log(msg);
    const constraints = {
      audio: true,
      video: {
        mandatory: {
          maxWidth: 320,
          maxFrameRate: 15,
          minFrameRate: 15
        }
      }
    };
    console.log(this.userId + ' registered in room ' + this.roomId);
    const participant = new Participant(this.userId, this.ws);
    this.participants[this.userId] = participant;
    const video = participant.video;

    this.rootElement.appendChild(video);

    const options = {
      localVideo: video,
      mediaConstraints: constraints,
      onicecandidate: participant.onIceCandidate.bind(participant)
    };
    participant.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options,
      function(error): void {
        if (error) {
          return console.error(error);
        }
        this.generateOffer(participant.offerToReceiveVideo.bind(participant));
      });

    // подключаем других участников
    for (const userId of msg.data) {
      this.receiveVideo(userId);
    }
  }


  leaveRoom(): void {
    console.log('leaveRoom');
    this.sendMessage({
      id: 'leaveRoom'
    });

    // tslint:disable-next-line:forin
    for (const key in this.participants) {
      this.participants[key].dispose();
    }

    this.ws.complete(); // ?
  }

  receiveVideo(userId): void {
    console.log('receiveVideo');
    const participant = new Participant(userId, this.ws);
    this.participants[userId] = participant;
    const video = participant.video;

    this.rootElement.appendChild(video);

    const options = {
      remoteVideo: video,
      onicecandidate: participant.onIceCandidate.bind(participant)
    };

    participant.rtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
      function(error): void {
        if (error) {
          return console.error(error);
        }
        this.generateOffer(participant.offerToReceiveVideo.bind(participant));
      });

  }

  onParticipantLeft(request): void {
    console.log('onParticipantLeft');
    console.log('Participant ' + request.userId + ' left');
    const participant = this.participants[request.userId];
    console.log(participant.dispose);
    participant.dispose();
    delete this.participants[request.userId];
  }


  sendMessage(message): void {
    console.log('sendMessage');
    console.log(`Sending message with id: ${message.id}`);
    this.ws.next(message);
  }
}
