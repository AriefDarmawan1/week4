const testimonials = [
  {
    image: "https://i.pinimg.com/564x/d1/a1/10/d1a1109050d7b469a6d3f8db74936240.jpg",
    content: "awsm",
    author: "jack n gill",
    rating: 1,
  },
  {
    image: "https://i.pinimg.com/564x/b1/19/50/b1195063dbba05d6deda2a7ba740169d.jpg",
    content: "goks!",
    author: "simpson",
    rating: 2,
  },
  {
    image: "https://i.pinimg.com/564x/03/fd/ee/03fdeebecb9eabbe6d3375c02b64d82b.jpg",
    content: "yooo!",
    author: "Dino",
    rating: 2,
  },
  {
    image: "https://i.pinimg.com/564x/ab/f1/6e/abf16ee08bd840308e15cce83048bbe4.jpg",
    content: "Papoy!",
    author: "MR.Groo",
    rating: 3,
  },
];

function allTestimonial() {
  if (!testimonials.length) {
    return (document.getElementById("testimonials").innerHTML = `<h1>Data not found!</h1>`);
  }

  const testimonialHTML = testimonials.map((testimonial) => {
    return `<div class="testimonial">
                <img src="${testimonial.image}" class="profile-testimonial" />
                <p class="quote">"${testimonial.content}"</p>
                <p class="author">- ${testimonial.author}</p>
            </div>`;
  });

  document.getElementById("testimonials").innerHTML = testimonialHTML.join("");
}

function filterTestimonial(rating) {
  // 2
  const filteredTestimonial = testimonials.filter((testimonial) => testimonial.rating == rating);

  if (!filteredTestimonial.length) {
    return (document.getElementById("testimonials").innerHTML = `<h1>Data not found!</h1>`);
  }

  const testimonialHTML = filteredTestimonial.map((testimonial) => {
    return `<div class="testimonial">
                    <img src="${testimonial.image}" class="profile-testimonial" />
                    <p class="quote">"${testimonial.content}"</p>
                    <p class="author">- ${testimonial.author}</p>
                </div>`;
  });

  document.getElementById("testimonials").innerHTML = testimonialHTML.join("");
}

allTestimonial();
