import { Observable } from '@nativescript/core';
import { Frame } from '@nativescript/core';

export class MainViewModel extends Observable {
    private _showLogin: boolean = false;
    private _username: string = '';
    private _password: string = '';

    constructor() {
        super();
    }

    get showLogin(): boolean {
        return this._showLogin;
    }

    get username(): string {
        return this._username;
    }

    set username(value: string) {
        if (this._username !== value) {
            this._username = value;
            this.notifyPropertyChange('username', value);
        }
    }

    get password(): string {
        return this._password;
    }

    set password(value: string) {
        if (this._password !== value) {
            this._password = value;
            this.notifyPropertyChange('password', value);
        }
    }

    onLoginTap() {
        this._showLogin = true;
        this.notifyPropertyChange('showLogin', this._showLogin);
    }

    onDashboardTap() {
        if (this._username && this._password) {
            Frame.topmost().navigate({
                moduleName: "dashboard/dashboard-page",
                clearHistory: true
            });
        }
    }
}