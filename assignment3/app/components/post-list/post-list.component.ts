import { Component } from "@angular/core";
import { Router, ActivatedRoute, Params } from '@angular/router';
import { OnInit } from "@angular/core";

import { IPost } from "../../interfaces/posts/ipost";
import { PostService } from "../../services/posts/posts.service";

@Component({
    selector: "post-list",
    templateUrl: "./app/components/post-list/post-list.component.html"
})
export class PostListComponent implements OnInit {
    postList: IPost[];
    page: number;
    prevPage: number;
    nextPage: number;
    totalPages: number;

    async ngOnInit() {
        this.postList = await this.postService.getPagePosts(this.page);
        this.totalPages = await this.postService.getTotalPages();

        this.nextPage = (this.page + 1 < this.totalPages) ? this.page + 1 : -1;
        this.prevPage = (this.page - 1 >= 0) ? this.page - 1 : -1;
    }

    async goToPage(pageNum: number) {
        this.page = pageNum;
        
        this.postList = await this.postService.getPagePosts(this.page);
        this.totalPages = await this.postService.getTotalPages();

        this.nextPage = (this.page + 1 < this.totalPages) ? this.page + 1 : -1;
        this.prevPage = (this.page - 1 >= 0) ? this.page - 1 : -1;
    }

    constructor(private postService: PostService, private route: ActivatedRoute, private router: Router) {
        this.page = parseInt(this.route.snapshot.params['page']);
    }
}
