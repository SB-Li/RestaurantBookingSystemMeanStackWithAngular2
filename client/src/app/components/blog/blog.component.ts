import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {

  messageClass;
  message;
  newPost = false;
  loadingBlogs = false;
  form;
  processing = false;
  username;
  blogPosts;
  confirmationCode;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private blogService: BlogService
  ) {
    this.createNewBlogForm(); // Create new blog form on start up
  }

  // Function to create new blog form
  createNewBlogForm() {
    this.form = this.formBuilder.group({
      // name field
      name: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(20),
        Validators.minLength(2)
      ])],
      phone: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(11),
        Validators.minLength(9),
        this.alphaNumericValidation
      ])],
      time: ['', Validators.compose([
        Validators.required
      ])],
      tablenumber: ['', Validators.compose([
        Validators.required
      ])],
      // Body field
      body: ['', Validators.compose([
        Validators.required,
        Validators.maxLength(500),
        Validators.minLength(5)
      ])]
    })
  }

  // Enable new blog form
  enableFormNewBlogForm() {
    this.form.get('name').enable(); // Enable name field
    this.form.get('phone').enable(); // Enable phone field
    this.form.get('time').enable(); // Enable time field
    this.form.get('tablenumber').enable();
    this.form.get('body').enable(); // Enable body field
  }

  // Disable new blog form
  disableFormNewBlogForm() {
    this.form.get('name').disable(); // Disable name field
    this.form.get('phone').disable(); // Disable phone field
    this.form.get('time').disable(); // Disable time field
    this.form.get('tablenumber').disable();
    this.form.get('body').disable(); // Disable body field
  }

  // Validation for name
  alphaNumericValidation(controls) {
    const regExp = new RegExp(/^[0-9 ]+$/); // Regular expression to perform test
    // Check if test returns false or true
    if (regExp.test(controls.value)) {
      return null; // Return valid
    } else {
      return { 'alphaNumericValidation': true } // Return error in validation
    }
  }

  // Function to display new blog form
  newBlogForm() {
    this.newPost = true; // Show new blog form
  }

  // Reload blogs on current page
  reloadBlogs() {
    this.loadingBlogs = true; // Used to lock button
    this.getAllBlogs(); // Add any new blogs to the page
    setTimeout(() => {
      this.loadingBlogs = false; // Release button lock after four seconds
    }, 4000);
  }

  // Function to post a new comment on blog post
  draftComment() {

  }

  // Function to submit a new blog post
  onBlogSubmit() {
    this.processing = true; // Disable submit button
    this.disableFormNewBlogForm(); // Lock form

    // Create blog object from form fields
    const blog = {
      name: this.form.get('name').value, // name field
      phone: this.form.get('phone').value, // Phone field
      time: this.form.get('time').value, // Time field
      tablenumber: this.form.get('tablenumber').value,
      body: this.form.get('body').value, // Body field
      createdBy: this.username // CreatedBy field
    }

   //Check Confliction
    for(var i = 0; i < this.blogPosts.length; i++) {
      if(this.blogPosts[i].time == blog.time && this.blogPosts[i].tablenumber == blog.tablenumber) {
      this.messageClass = 'alert alert-danger'; // Return error class
      this.message = "Table & Time Conflict! This table is already booked at this time. Please select another table or time";
      this.processing = false; // Enable submit button
      this.enableFormNewBlogForm(); // Enable form
      return;
      }
     }

    // Function to save blog into database
    this.blogService.newBlog(blog).subscribe(data => {
      // Check if blog was saved to database or not
      if (!data.success) {
        this.messageClass = 'alert alert-danger'; // Return error class
        this.message = data.message; // Return error message
        this.processing = false; // Enable submit button
        this.enableFormNewBlogForm(); // Enable form
      } else {
        this.messageClass = 'alert alert-success'; // Return success class
        this.message = data.message; // Return success message
        this.getAllBlogs();
        // Clear form data after two seconds
        setTimeout(() => {
          this.newPost = false; // Hide form
          this.processing = false; // Enable submit button
          this.message = false; // Erase error/success message
          this.form.reset(); // Reset all form fields
          this.enableFormNewBlogForm(); // Enable the form fields
        }, 2000);
      }
    });
  }

  // Function to go back to previous page
  goBack() {
    window.location.reload(); // Clear all variable states
  }

  // Function to get all blogs from the database
  getAllBlogs() {
    // Function to GET all blogs from database
    this.blogService.getAllBlogs().subscribe(data => {
      this.blogPosts = data.blogs; // Assign array to use in HTML
    });
  }

  ngOnInit() {
    // Get profile username on page load
    this.authService.getProfile().subscribe(profile => {
      this.username = profile.user.username; // Used when creating new blog posts and comments
    });

    this.getAllBlogs(); // Get all blogs on component load
  }

}
