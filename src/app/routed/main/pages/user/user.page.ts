import {Component, OnInit} from '@angular/core';
import {UserService} from '../../../../features/core/services/user.service';
import {User} from '../../../../features/core/models/user.model';
import {AuthService} from '../../../../features/core/services/auth.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss']
})
export class UserPage implements OnInit {

  user: User;

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {
  }

  ngOnInit(): void {
    this.authService.getUser().subscribe(value => {
      this.user = value;
    });
  }

}
