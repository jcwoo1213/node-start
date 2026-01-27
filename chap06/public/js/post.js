//post.js
// http://localhost:3001/posts

document.querySelector("#loadBtn").addEventListener("click", (e) => {
  const id = document.querySelector("#productIdInput").value;
  console.log(id);
  fetch(`products?id=${id}`)
    .then((res) => res.json())
    .then(async (data) => {
      console.log(data);
      if (data.length == 0) {
        return;
      }
      const productBox = document.querySelector("#productBox");
      productBox.innerHTML = "";

      const product = `<h2 class="title">${data[0].name}</h2>
          <p class="price">${Number(data[0].price).toLocaleString()}원</p>
          <p class="muted">판매자: ${data[0].seller}</p>`;
      productBox.innerHTML += product;
      const reviews = await getReview(id);
      const reviewBox = document.querySelector("#reviewBox");
      reviewBox.innerHTML = "";
      for (const r of reviews) {
        const reviewContent = `<div class="review">
                <div class="muted">작성자: ${r.writer} · 후기번호: ${r.id}</div>
                <div style="margin-top:6px;">${r.content}</div>
              </div>`;
        reviewBox.innerHTML += reviewContent;
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

async function getReview(productId) {
  const reviews = await fetch(`reviews?productId=${productId}`);
  const result = await reviews.json();
  return result;
}
