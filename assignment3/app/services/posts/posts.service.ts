import { Injectable } from "@angular/core";
import { IPost } from "../../interfaces/posts/ipost";

import { Http, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class PostService {
    private _postUrl: string = "/posts";

    constructor(private http: Http) {
    }

    async getTotalPages(): Promise<number> {
        return this.http.get('totalPages')
            .map(res => {
                return res.json().total || undefined;
            })
            .toPromise();
    };

    async getPagePosts(page: number): Promise<IPost[]> {
        return this.http.get(`archive/${page}`)
            .map(res => {
                return res.json() || [];
            })
            .toPromise();
    };

    async getPostById(id: string) {
        return this.http.get(`${this._postUrl}/${id}`)
            .map(res => {
                return res.json() || undefined;
            })
            .toPromise();
    };

    async createPost(newPost: IPost) {
        return this.http.post(`${this._postUrl}`, newPost)
            .map(res => {
                return res.json() || undefined;
            })
            .toPromise();
    };
}
