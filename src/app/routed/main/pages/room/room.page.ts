import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {WebSocketSubject} from 'rxjs/internal-compatibility';
import * as kurentoUtils from 'kurento-utils';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss']
})
export class RoomPage implements OnInit, AfterViewInit {
  @ViewChild('uiLocalVideo') uiLocalVideo!: ElementRef;
  @ViewChild('uiRemoteVideo') uiRemoteVideo!: ElementRef;
  ws: WebSocketSubject<any>;
  webRtcPeer: any;
  uiState = null;
  UI_IDLE = 0;
  UI_STARTING = 1;
  UI_STARTED = 2;
  private readonly wsUrl = 'wss://localhost:8443/helloworld';

  constructor() {
    this.ws = new WebSocketSubject(this.wsUrl);
    console.log('Page loaded');
    this.uiSetState(this.UI_IDLE);
  }

  ngOnInit(): void {
    this.ws.subscribe(value => {
      this.handleMessage(value);
    });
  }

  ngAfterViewInit(): void {
    this.uiStart();

  }

  handleMessage(message: any): void {
    switch (message.id) {
      case 'PROCESS_SDP_ANSWER':
        this.handleProcessSdpAnswer(message);
        break;
      case 'ADD_ICE_CANDIDATE':
        this.handleAddIceCandidate(message);
        break;
      case 'ERROR':
        this.handleError(message);
        break;
      default:
        // Ignore the message
        console.warn('[onmessage] Invalid message, id: ' + message.id);
        break;
    }
  }

  handleProcessSdpAnswer(jsonMessage: any): void {
    console.log('[handleProcessSdpAnswer] SDP Answer from Kurento, process in WebRTC Peer');

    if (this.webRtcPeer == null) {
      console.warn('[handleProcessSdpAnswer] Skip, no WebRTC Peer');
      return;
    }

    this.webRtcPeer.processAnswer(jsonMessage.sdpAnswer, (err) => {
      if (err) {
        this.sendError('[handleProcessSdpAnswer] Error: ' + err);
        stop();
        return;
      }

      console.log('[handleProcessSdpAnswer] SDP Answer ready; start remote video');
      this.startVideo(this.uiRemoteVideo);

      this.uiSetState(this.UI_STARTED);
    });
  }

  handleError(jsonMessage: any): void {
    console.log(jsonMessage);
  }

  sendMessage(message): void {
    if (this.ws.closed || this.ws.isStopped) {
      console.warn('[sendMessage] Skip, WebSocket session isn\'t open');
      return;
    }
    console.log('[sendMessage] message: ' + JSON.stringify(message));
    this.ws.next(message);
  }

  uiSetState(newState): void {
    this.uiState = newState;
  }

  uiStart(): void {
    console.log('[start] Create WebRtcPeerSendrecv');
    this.uiSetState(this.UI_STARTING);

    const options = {
      localVideo: this.uiLocalVideo.nativeElement,
      remoteVideo: this.uiRemoteVideo.nativeElement,
      mediaConstraints: {audio: false, video: true},
      onicecandidate: (candidate) => this.sendMessage({
        id: 'ADD_ICE_CANDIDATE',
        candidate,
      }),
    };

    this.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options,
      (err) => {
        if (err) {
          this.sendError('[start/WebRtcPeerSendrecv] Error: ' + err);
          this.stop();
          return;
        }

        console.log('[start/WebRtcPeerSendrecv] Created; start local video');
        this.startVideo(this.uiLocalVideo);

        console.log('[start/WebRtcPeerSendrecv] Generate SDP Offer');
        this.webRtcPeer.generateOffer((err2, sdpOffer) => {
          if (err2) {
            this.sendError('[start/WebRtcPeerSendrecv/generateOffer] Error: ' + err);
            stop();
            return;
          }

          this.sendMessage({
            id: 'PROCESS_SDP_OFFER',
            sdpOffer,
          });

          console.log('[start/WebRtcPeerSendrecv/generateOffer] Done!');
          this.uiSetState(this.UI_STARTED);
        });
      });
  }

  stop(): void {
    if (this.uiState === this.UI_IDLE) {
      console.log('[stop] Skip, already stopped');
      return;
    }

    console.log('[stop]');

    if (this.webRtcPeer) {
      this.webRtcPeer.dispose();
      this.webRtcPeer = null;
    }

    this.uiSetState(this.UI_IDLE);

    this.sendMessage({
      id: 'STOP',
    });
  }

  private handleAddIceCandidate(jsonMessage: any): void {
    if (this.webRtcPeer == null) {
      console.warn('[handleAddIceCandidate] Skip, no WebRTC Peer');
      return;
    }

    this.webRtcPeer.addIceCandidate(jsonMessage.candidate, (err) => {
      if (err) {
        console.error('[handleAddIceCandidate] ' + err);
        return;
      }
    });
  }

  private sendError(s: string): void {
    console.log(s);
    this.sendMessage({id: 'ERROR', message: s});
  }

  private startVideo(video: any): void {
    console.log(video);
    // Manually start the <video> HTML element
    // This is used instead of the 'autoplay' attribute, because iOS Safari
    // requires a direct user interaction in order to play a video with audio.
    // Ref: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
    video.nativeElement.play().catch((err) => {
      if (err.name === 'NotAllowedError') {
        console.error('[start] Browser doesn\'t allow playing video: ' + err);
      } else {
        console.error('[start] Error in video.play(): ' + err);
      }
    });
  }
}
