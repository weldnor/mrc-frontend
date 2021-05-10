import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Room} from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  constructor(private readonly http: HttpClient) {
  }

  getAllRooms(): Observable<Room[]> {
    return this.http.get<Room[]>('/api/v1/rooms');
  }

  getRoom(roomId: number): Observable<Room> {
    return this.http.get<Room>(`/api/v1/rooms/${roomId}`);
  }
}
