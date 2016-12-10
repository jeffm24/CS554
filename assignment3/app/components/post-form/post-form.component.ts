import {Component, Input} from "@angular/core";
import {Router} from '@angular/router';

import {IPost} from "../../interfaces/posts/ipost";
import {PostListComponent} from "../../components/post-list/post-list.component";
import {PostService} from "../../services/posts/posts.service";

@Component({
    selector: "post-form",
    templateUrl: "./app/components/post-form/post-form.component.html"
})
export class PostFormComponent {
    @Input() 
    
    post: IPost;

    ngOnInit() {
        this.post = {
            id: '',
            title: '',
            body: '',
            created: '',
            encodedImg: ''
        };
    }

    postNew(post: IPost, isValid: boolean) {
        if (!post.title || !post.body) {
            alert("Please include both a title and a body.");
        }

        var self = this;
        var reader = new FileReader();
        var file = (document.getElementById('image') as any).files[0];

        var reader = new FileReader();

        // when image data was read
        reader.onload = function(event) {
            post.encodedImg = reader.result;

            self.postService.createPost(post).then(function() {
                self.router.navigate(['/archive/0', {}]);
            });
        }

        // read data from file
        if (file) {
            reader.readAsDataURL(file);
        } else {
            self.postService.createPost(post).then(function() {
                self.router.navigate(['/archive/0', {}]);  
            });
        }
    }
    
    constructor(private postService: PostService, private router: Router) {
    }
}
