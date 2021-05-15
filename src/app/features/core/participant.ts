import {WebSocketSubject} from 'rxjs/internal-compatibility';

export class Participant {

  container: HTMLElement;
  video: HTMLVideoElement;
  rtcPeer;

  constructor(
    private readonly userId: number,
    private readonly ws: WebSocketSubject<any>
  ) {
    const container = document.createElement('div');
    container.id = String(userId);
    const span = document.createElement('span');
    const video = document.createElement('video');

    container.appendChild(video);
    container.appendChild(span);

    video.id = 'video-' + userId;
    video.autoplay = true;
    video.controls = false;

    this.container = container;
    this.video = video;
  }

  offerToReceiveVideo(error, offerSdp): void {
    console.log('offerToReceiveVideo');

    if (error) {
      return console.error('sdp offer error');
    }
    console.log('Invoking SDP offer callback function');
    const msg = {
      id: 'receiveVideoFrom',
      userId: this.userId,
      sdpOffer: offerSdp
    };
    this.sendMessage(msg);
  }

  onIceCandidate(candidate): void {
    console.log('onIceCandidate');
    console.log('---------------------');
    console.log(candidate);
    console.log('---------------------');
    const message = {
      id: 'onIceCandidate',
      candidate,
      userId: this.userId
    };
    this.sendMessage(message);
  }

  sendMessage(message): void {
    console.log('sendMessage');
    console.log('Sending message: ' + JSON.stringify(message));
    this.ws.next(message);
  }
}
