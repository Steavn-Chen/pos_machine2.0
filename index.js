// 3.變數宣告
const menu = document.getElementById('menu')
const cart = document.getElementById('cart')
const totalAmount = document.getElementById('total-amount')
const button = document.getElementById('submit-button')
const clearButton = document.getElementById('clear-button')
const clearNextBuyButton = document.querySelector('#clear-nextbuy-button')

let productData = []
let cartItems = []
let nextcartItems = []
let total = 0
let productMap = {}
// 4.GET API 菜單產品資料
axios.get('https://ac-w3-dom-pos.firebaseio.com/products.json')
  .then(function (response) {
    productMap = {}
    productData = response.data
    productData.forEach(product => {
      productMap[product.id] = product
    })
    displayProduct(productData)
  })
  .catch(function (error) {
    console.log(error)
  })

// 5.將產品資料加入菜單區塊
function displayProduct(products) {
  products.forEach(product => menu.innerHTML += `
    <div class="col-3">
       <div class="card">
          <img src=${product.imgUrl} class="card-img-top" alt="...">
          <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text">${product.price}</p>
            <a id="${product.id}"  href="#" class="btn btn-primary incartbutton" data-id="${product.id}" >加入購物車</a>
          </div>
        </div>
      </div>
  `)
}

// 6.加入購物車
function addToCart(event) {
  // 找到觸發event的node元素，並得到其產品id
  const id = event.target.dataset.id
  // 在productData的資料裡，找到點擊的產品資訊，加入 cartItems
  const addProduct = productData.find(function (product) { return product.id === id })
  const name = addProduct.name
  const price = addProduct.price
  // 加入購物車變數cartItems 分：有按過、沒按過
  const targetItem = cartItems.find(function (item) { return item.id === id })
  if (nextcartItems.some(function (item) { return item.id === id })) { return alert('提醒您的下次再買清單有此品項,可以到下次再買清單把想要的東西跟數量選好並放回購物車再送出訂單,謝謝你光臨本賣場^^.') }
  if (targetItem) {
    targetItem.quantity += 1
  } else {
    cartItems.push({
      id: id,        //id:id
      name: name,    //name:name
      price: price,  //price:price
      quantity: 1,
    })
  }
  renderCartMenu(cart, cartItems)
  // 計算總金額
  calculateTotal(price)
}


// 7.計算總金額
function calculateTotal(amount) {
  total += amount
  totalAmount.textContent = total
}
// 8.送出訂單
function submit(event) {
  if (event.target.matches('button')) {
    if (total === 0) {
      return alert('您還沒把喜歡的餐點加到購物清單中')
    } else if (total !== 0) {
      alert(`您全部餐點總金額為:${total}元`)
    }
  }
  reset()
}

// 9.重置購物車單
function reset() {
  if (cartItems.length === 0) {
    alert('您的購物車清單目前沒任何東西哦^_^')
  }
  cartItems = []
  cart.innerHTML = cartItems
  total = 0
  totalAmount.textContent = total
}

// 重置下次再買清單
function resetNextBuy() {
  if (nextcartItems.length === 0) { alert('您的下次再買清單目前沒任何東西哦^_^') }
  nextcartItems = []
  nextcartmenu.innerHTML = nextcartItems
}

// 刪除購物車清單品項
function removeShoppingList(id) {
  if (!cartItems) return
  const itemIndex = cartItems.findIndex(function (items) { return items.id === id })
  cartItems.splice(itemIndex, 1)
  cart.innerHTML = cartItems
}

// 刪除下次再買清單品項
function removeNextShoppingList(id) {
  if (!nextcartItems) return
  const itemIndex = nextcartItems.findIndex(function (items) { return items.id === id })
  nextcartItems.splice(itemIndex, 1)
}

function renderCartMenu(menuTargetElement, cartList) {
  let btnHtml = ''
  const getBtnHtml = (str) => `${str}`

  if (menuTargetElement === cart) {
    btnHtml = getBtnHtml('nextbuy-button')
  } else if (menuTargetElement === nextcartmenu) {
    btnHtml = getBtnHtml('beforebuy-button')
  }

  menuTargetElement.innerHTML = cartList.map(function (item) {
    return `<li class="list-group-item d-flex justify-content-between align-items-center " >${item.name} X ${item.quantity} 小計：${item.quantity * item.price} <div><button id="plus-button" type="button" class="btn btn-primary"  data-id="${item.id}">+</button> <button id="minus-button" type="button" class="btn btn-primary" data-id="${item.id}">-</button> <button id="delete-button" type="button" class="delete btn btn-danger" data-id="${item.id}">X</button> <button id="${btnHtml}" type="button" class="next btn btn-outline-secondary"  data-id="${item.id}"> <i class="fas fa-shopping-cart" ></i></button> 
   </div></li>
  `}).join('\n')
}

// 10. 加入事件監聽
button.addEventListener('click', submit)
clearButton.addEventListener('click', reset)
clearNextBuyButton.addEventListener('click', resetNextBuy)
menu.addEventListener('click', function oncartItemslist(event) {
  if (event.target.matches(".incartbutton")) {
    addToCart(event)
  }
})
// 購物車清單按紐監聽器
cart.addEventListener('click', function oncartclicked(event) {
  const id = event.target.dataset.id
  const targetItem = cartItems.find(function (item) { return item.id === id })
  if (event.target.matches('#delete-button')) {
    total -= Number(targetItem.price * targetItem.quantity)
    totalAmount.textContent = total
    removeShoppingList(id)
  } else if (event.target.matches('#plus-button')) {
    if (targetItem) {
      targetItem.quantity += 1
      total += targetItem.price
      totalAmount.textContent = total
    }
  } else if (event.target.matches('#minus-button')) {
    if (targetItem.quantity > 1) {
      targetItem.quantity -= 1
      total -= targetItem.price
      totalAmount.textContent = total
    }
    else if (targetItem.quantity === 1) {
      total -= targetItem.price
      totalAmount.textContent = total
      removeShoppingList(id)
    }
  } else if (event.target.matches("#nextbuy-button")) {
    total -= Number(targetItem.price * targetItem.quantity)
    totalAmount.textContent = total
    removeShoppingList(id)
    nextcartItems.push(targetItem)
  }

  renderCartMenu(cart, cartItems)
  renderCartMenu(nextcartmenu, nextcartItems)
})
// 下次再買清單按紐監聽器
nextcartmenu.addEventListener('click', function oncartnextbuyclicked(event) {
  const id = event.target.dataset.id
  const targetItem = nextcartItems.find(function (item) { return item.id === id })
  if (event.target.matches('#delete-button')) {
    removeNextShoppingList(id)
  } else if (event.target.matches('#plus-button')) {
    if (targetItem) {
      targetItem.quantity += 1
    }
  } else if (event.target.matches('#minus-button')) {
    if (targetItem.quantity > 1) {
      targetItem.quantity -= 1
    } else if (targetItem.quantity === 1) {
      removeNextShoppingList(id)
    }
  } else if (event.target.matches('#beforebuy-button')) {
    total += Number(targetItem.price * targetItem.quantity)
    totalAmount.textContent = total
    cartItems.push(targetItem)
    removeNextShoppingList(id)
  }
  renderCartMenu(cart, cartItems)
  renderCartMenu(nextcartmenu, nextcartItems)
})



