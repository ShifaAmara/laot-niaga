/*==========================================
    LAOT NIAGA
    MARKETPLACE.JS
==========================================*/

document.addEventListener("DOMContentLoaded", () => {

    initMarketplace();

});



let products = [];
let filteredProducts = [];

let currentKeyword = "";
let currentCategory = "";

async function initMarketplace() {

    const grid = document.querySelector("[data-marketplace-grid]");

    if (!grid) return;

    showLoading();

    try {

        products = await getProducts();

        filteredProducts = [...products];

        initSearch();

        initCategory();

        renderProducts(filteredProducts);

    } catch (err) {

        console.log(err);

        grid.innerHTML = `
        <div class="col-12 text-center py-5">

            <h4>Produk gagal dimuat.</h4>

        </div>
        `;

    }

}

function initSearch() {

    document.querySelectorAll("[data-search]").forEach(input => {

        input.addEventListener("input", e => {

            currentKeyword = e.target.value.toLowerCase();

            document.querySelectorAll("[data-search]").forEach(other => {

                other.value = e.target.value;

            });

            filterProducts();

        });

    });

}

function initCategory() {

    document.querySelectorAll(".cat-pill").forEach(btn => {

        btn.onclick = () => {

            document.querySelectorAll(".cat-pill").forEach(item => {

                item.classList.remove("active");

            });

            btn.classList.add("active");

            currentCategory = btn.dataset.category;

            filterProducts();

        }

    });

}

function filterProducts() {

    filteredProducts = products.filter(product => {

        const text = (

            product.name +

            product.description +

            product.store_name

        ).toLowerCase();

        const category =

            (product.category || "")

            .toLowerCase()

            .replace(/\s/g, "-");

        const keywordOK =

            !currentKeyword ||

            text.includes(currentKeyword);

        const categoryOK =

            !currentCategory ||

            currentCategory === category;

        return keywordOK && categoryOK;

    });

    renderProducts(filteredProducts);

}
function renderProducts(data){

    const grid=document.querySelector("[data-marketplace-grid]");

    if(!grid) return;

    if(data.length===0){

        grid.innerHTML=`

        <div class="col-12 text-center py-5">

            <i class="bi bi-search fs-1"></i>

            <h3 class="mt-3">

                Produk tidak ditemukan

            </h3>

        </div>

        `;

        return;

    }

    grid.innerHTML=data.map(product=>`

    <div class="col">

        ${card(product)}

    </div>

    `).join("");

    bindCard();

}

function card(product){

return`

<div class="card card-product h-100">

<div class="img-wrapper">

<img

src="${productImage(product)}"

alt="${product.name}"

>

</div>

<div class="card-body">

<div class="d-flex

justify-content-between

mb-2">

<span class="store-badge">

🏪 ${product.store_name}

</span>

<span class="store-badge">

⭐4.8

</span>

</div>

<h6 class="product-title">

${product.name}

</h6>

<p class="product-location text-muted">

${product.origin}

</p>

<div class="product-price mb-3">

    ${rupiah(product.price)}

    <small>/ ${product.unit}</small>

</div>

<div class="d-flex align-items-center gap-2">

    <a

        href="product-detail.html?id=${product.id}"

        class="btn-detail flex-grow-1"

    >

        Lihat Detail

    </a>

    <button

        class="btn-cart-icon"

        data-id="${product.id}"

    >

        <i class="bi bi-cart-plus"></i>

    </button>

</div>

</div>

</div>

`;

}
function bindCard(){

document

.querySelectorAll(".btn-cart")

.forEach(btn=>{

btn.onclick=()=>{

const id=btn.dataset.id;

location.href=

`product-detail.html?id=${id}`;

}

});

}

function showLoading(){

const grid=document

.querySelector("[data-marketplace-grid]");

if(!grid) return;

let html="";

for(let i=0;i<8;i++){

html+=`

<div class="col">

<div class="placeholder-glow">

<div

class="placeholder

w-100"

style="height:220px">

</div>

</div>

<p class="placeholder-glow mt-2">

<span class="placeholder col-8"></span>

</p>

<p class="placeholder-glow">

<span class="placeholder col-6"></span>

</p>

</div>

`;

}

grid.innerHTML=html;

}