/*=========================================
        PRODUCT DETAIL
=========================================*/

document.addEventListener("DOMContentLoaded",()=>{

    loadProduct();

});

let qty = 1;

async function loadProduct(){

    const params = new URLSearchParams(window.location.search);

    const id = params.get("id");

    if(!id){

        location.href="marketplace.html";

        return;

    }

    const products = await getProducts();

    const product = products.find(p=>String(p.id)===String(id));

    if(!product){

        document.getElementById("productInfo").innerHTML=`

            <h2>Produk tidak ditemukan</h2>

        `;

        return;

    }

    renderProduct(product);

}

function renderProduct(product){

    document.getElementById("productImage").innerHTML=`

        <div class="store-card">

            <div class="store-left">

                <img

                src="assets/img/logo biru.png"

                class="store-logo">

                <div>

                    <div class="store-name">

                        ${product.store_name}

                    </div>

                    <div class="store-location">

                        ${product.origin}

                    </div>

                </div>

            </div>

            <button class="store-chat">

                Tanya Penjual

            </button>

        </div>

        <img

        src="${productImage(product)}"

        class="product-photo">

    `;

    document.getElementById("productInfo").innerHTML=`

        <h1 class="product-name">

            ${product.name}

        </h1>

        <div class="product-rating">

            <div>

                ⭐⭐⭐⭐☆

            </div>

            <span>

                4.8 (36 review)

            </span>

        </div>

        <div class="product-price">

            ${rupiah(product.price)}

            <small>

                / ${product.unit}

            </small>

        </div>

        <div class="product-description">

            ${product.description}

        </div>

        <div class="section-label">

            Pilih Ukuran

        </div>

        <div class="size-group">

            <button class="size-btn active">

                250 gram

            </button>

            <button class="size-btn">

                500 gram

            </button>

            <button class="size-btn">

                1 kilogram

            </button>

            <button class="size-btn">

                2 kilogram

            </button>

        </div>

        <div class="section-label">

            Jumlah

        </div>

        <div class="qty-box">

            <button

            class="qty-btn"

            id="minusQty">

            -

            </button>

            <div

            class="qty-value"

            id="qtyValue">

            1

            </div>

            <button

            class="qty-btn"

            id="plusQty">

            +

            </button>

        </div>

        <div class="action-group">

            <button

            class="btn-cart-detail"

            id="addCart">

            Masukkan Keranjang

            </button>

            <button

            class="btn-buy"

            id="buyNow">

            Beli

            </button>

        </div>

    `;

    initButton(product);

}

function initButton(product){

    document.getElementById("minusQty").onclick=()=>{

        if(qty>1){

            qty--;

            document.getElementById("qtyValue").innerHTML=qty;

        }

    }

    document.getElementById("plusQty").onclick=()=>{

        qty++;

        document.getElementById("qtyValue").innerHTML=qty;

    }

    document.getElementById("addCart").onclick=()=>{

        let cart=JSON.parse(

            localStorage.getItem("cart")||"[]"

        );

        cart.push({

            ...product,

            qty

        });

        localStorage.setItem(

            "cart",

            JSON.stringify(cart)

        );

        alert("Produk berhasil ditambahkan ke keranjang");

    }

    document.getElementById("buyNow").onclick=()=>{

        alert("Fitur checkout akan dibuat selanjutnya.");

    }

}