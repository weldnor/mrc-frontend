import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {KurentoService} from '../../../../features/core/services/kurento.service';

@Component({
  selector: 'app-room',
  templateUrl: './room.page.html',
  styleUrls: ['./room.page.scss']
})
export class RoomPage implements AfterViewInit {
  @ViewChild('uiLocalVideo') uiLocalVideo!: ElementRef;
  @ViewChild('uiRemoteVideo') uiRemoteVideo!: ElementRef;

  constructor(private readonly kurentoService: KurentoService) {
  }


  ngAfterViewInit(): void {
    this.kurentoService.start(this.uiLocalVideo.nativeElement, this.uiRemoteVideo.nativeElement);
  }
}
