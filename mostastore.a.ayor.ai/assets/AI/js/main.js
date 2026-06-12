if (!sessionStorage.getItem('pageLoadTime')) {
  sessionStorage.setItem('pageLoadTime', Date.now());
}

// ================== DESIGN IMAGES PERFORMANCE ==================
// Optimize design-images without hurting LCP/CLS
(function () {
  const designImages = document.querySelectorAll('.design-images img');
  const fold = window.innerHeight || 800;

  designImages.forEach((img) => {
    // Decoding hint (safe)
    if (!img.hasAttribute('decoding')) {
      img.setAttribute('decoding', 'async');
    }

    // Avoid forcing lazy-loading above-the-fold (can break Lighthouse LCP checks)
    const rect = img.getBoundingClientRect();
    const isLikelyAboveFold = rect.top >= 0 && rect.top < fold * 1.25;

    if (isLikelyAboveFold) {
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'eager');
      if (!img.hasAttribute('fetchpriority')) img.setAttribute('fetchpriority', 'high');
    } else {
      // Below fold: lazy + low priority is fine
      if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
      if (!img.hasAttribute('fetchpriority')) img.setAttribute('fetchpriority', 'low');
    }
  });
})();
// ================== END DESIGN IMAGES PERFORMANCE ==================

// ================== ON PAGE LOAD ==================
// Set the default pattern on page load
window.onload = () => {
  const countryCode = document.querySelector('input[name="country-code"]')?.value;
    setPhonePattern(countryCode);
};
// ============== END ON PAGE LOAD ==============
// ============== GLOBAL VARIABLES ==============
const AYOR_URL = "https://backend.ayor.ai";
// ============== end GLOBAL VARIABLES ==============

(function () {
  if (typeof window.__getDeviceFingerprint === 'function') return;
  let cached = null;
  let pending = null;
  window.__getDeviceFingerprint = function () {
    if (cached !== null) return Promise.resolve(cached);
    if (pending) return pending;
    pending = (async function () {
      try {
        if (!window.ThumbmarkJS || typeof window.ThumbmarkJS.getFingerprint !== 'function') {
          await new Promise(function (resolve) {
            const s = document.createElement('script');
            s.src = 'https://cdn.jsdelivr.net/npm/@thumbmarkjs/thumbmarkjs@1.7.6/dist/thumbmark.umd.min.js';
            s.async = true;
            s.crossOrigin = 'anonymous';
            s.onload = resolve;
            s.onerror = resolve;
            document.head.appendChild(s);
            setTimeout(resolve, 4000);
          });
        }
        if (!window.ThumbmarkJS || typeof window.ThumbmarkJS.getFingerprint !== 'function') {
          cached = '';
          return cached;
        }
        const fp = await window.ThumbmarkJS.getFingerprint();
        cached = typeof fp === 'string' ? fp : '';
        return cached;
      } catch (_err) {
        cached = '';
        return cached;
      } finally {
        pending = null;
      }
    })();
    return pending;
  };
})();

// ============== session id generation ==============
function generateUniqueSessionId(length = 64) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let uniqueId = '';

  for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      uniqueId += characters[randomIndex];
  }

  return uniqueId;
}

const sessionId = generateUniqueSessionId();
// ============== end session id generation ==============

// ============== start sticky button  ==============
const stickyBtnContainer = document.querySelector('.sticky-btn-container');
const buyBtn = document.querySelector('#buy-btn');
const orderForm = document.querySelector('#order-form');

// Create a new Intersection Observer instance
const observer = new IntersectionObserver(handleIntersection, 
  { threshold: 0,
    rootMargin: "-50px", 
  });

// Observe the buy-btn element
if (buyBtn) observer.observe(buyBtn);

function handleIntersection(entries) {
    if (!entries[0].isIntersecting) {
      stickyBtnContainer.classList.add('show');
    } else {
      stickyBtnContainer.classList.remove('show');
    }
}

// Add event listener to the sticky button
stickyBtnContainer.querySelector('#sticky-buy-btn').addEventListener('click', () => {
  const topOfOrderForm = orderForm.getBoundingClientRect().top + window.pageYOffset;
  window.scrollTo({ top: topOfOrderForm - 20, behavior: 'smooth' });
});
// ============== end sticky button logic ==============
// ============== start toast ================
const ToastElement = document.querySelector(".toast")
const closeToastButton = document.querySelector(".toast .close-toast")
closeToastButton.addEventListener("click", ()=>{
  ToastElement.classList.remove("active")
})
// ============== end toast ==================

// ============== start product images slider ==============
const mainImg = document.querySelector('.main-img');
const slideImgs = document.querySelectorAll('.slide-img');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');
let currentIndex = 0;

  slideImgs.forEach(img => {
    img.addEventListener('click', () => {
      mainImg.src = img.dataset.fullSrc || img.src;
      mainImg.srcset = (img.dataset.midSrc || img.src) + ' 400w, ' + (img.dataset.fullSrc || img.src) + ' 800w';
      slideImgs.forEach(otherImg => otherImg.classList.remove("selected"));
      img.classList.add('selected');
      currentIndex = Array.from(slideImgs).indexOf(img);
    });
  });

  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + slideImgs.length) % slideImgs.length;
    updateMainImage();
  });

  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % slideImgs.length;
    updateMainImage();
  });

  function updateMainImage() {
    const currentSlide = slideImgs[currentIndex];
    mainImg.src = currentSlide.dataset.fullSrc || currentSlide.src;
    mainImg.srcset = (currentSlide.dataset.midSrc || currentSlide.src) + ' 400w, ' + (currentSlide.dataset.fullSrc || currentSlide.src) + ' 800w';
    slideImgs.forEach(img => img.classList.remove('selected'));
    currentSlide.classList.add('selected');
  }
// ================== end product images slider ==============

// ============== start order form ==============
const MIN_QUANTITY = 1;
const MAX_SINGLE_DIGIT_NUMBER = 9;
const MIN_DOUBLE_DIGIT_NUMBER = 10;

const shopId = document.querySelector('input[name="shop-id"]')?.value;
const productId = document.querySelector('input[name="product-id"]')?.value
const language = document.documentElement.lang;
const orderButton = document.querySelector("#buy-btn");
const stickyBuyBtn = document.querySelector('#sticky-buy-btn');
let isSubmitting = false;
const orderQuantityElement = document.querySelector("#order-quantity");
const productPriceValue = document.querySelector('input[name="product-price"]')?.value
const productReducedPriceValue = document.querySelector('input[name="product-reduced-price"]')?.value
const hasVariants = Boolean(document.querySelector('.variants-wrapper'));
const hasOptions = Boolean(document.querySelector('#options'));
const isHybridMode = hasOptions && hasVariants; // Check if both options and variants exist
const priceValue = productReducedPriceValue ? productReducedPriceValue : productPriceValue;
const paymentMethod = document.querySelector('input[name="payment-method"]')?.value;
let deliveryPrice = 0;
let stopdDeskDeliveryPrice = 0;
let isStopDesk = false;
let currentPixelEventId = "";

// handle wilaya change: update communes + update delivery price
function handleWilayaSelection(isBundle = false) {
  resetDeliveryType(isBundle);
  const wilayaSelectElement = isBundle ? document.querySelector('#bundle-form select[name="bundle-wilaya"]') : document.querySelector('select[name="wilaya"]');
  const wilayaDelivryPrice = +wilayaSelectElement.selectedOptions[0].dataset.deliveryPrice;
  const wilayaStopDeskPrice = +wilayaSelectElement.selectedOptions[0].dataset.stopDeskPrice;
  
  updateStopDeskPrice(wilayaStopDeskPrice || 0, isBundle);
  updateDeliveryPrice(wilayaDelivryPrice || 0, isBundle);
  // update delivery price in the summary only if the selected option has no delivery price
  if (!hasOptions || (hasOptions && !selectedOption?.deliveryPrice)) {
    updateSummaryDeliveryPriceUI(wilayaDelivryPrice || 0, isBundle);
    updateSummaryTotalPriceUI(isBundle);
  }

  updateCommunes(isBundle);
}

// handleDeliveryTypeSelection
function handleDeliveryTypeSelection(isBundle = false, ) {

  const deliveryTypeEelment = isBundle ? document.getElementById('bundle-delivery-type') : document.getElementById('delivery-type');
  const deliveryTypeValue = deliveryTypeEelment.value;
  const isStopDesk = deliveryTypeValue === 'stopdesk';

  if (isBundle) {
    const deliveryPrice = isStopDesk ? bundleStopdDeskDeliveryPrice : bundleDeliveryPrice;

    updateStopDesk(isStopDesk, isBundle);
    updateSummaryDeliveryPriceUI(deliveryPrice, isBundle);
    updateSummaryTotalPriceUI(isBundle);
  } else {
    updateStopDesk(isStopDesk);

    if (!hasOptions || (hasOptions && !selectedOption?.deliveryPrice)) {
        const price = isStopDesk ? stopdDeskDeliveryPrice : deliveryPrice;
        updateSummaryDeliveryPriceUI(price);
        updateSummaryTotalPriceUI();
    }
  }

}

// update communes on wilaya change
async function updateCommunes(isBundle = false) {
  const wilayaFormSelector = isBundle ? '#bundle-form select[name="bundle-wilaya"]' : 'select[name="wilaya"]';
  const communeFormSelector = isBundle ? '#bundle-form select[name="bundle-commune"]' : 'select[name="commune"]';
  const wilayaSelectElement = document.querySelector(`${wilayaFormSelector}`);
  const communeSelectElement = document.querySelector(`${communeFormSelector}`);
  const currentCommuneFormSelectorPlaceholder = communeSelectElement.options[0]?.textContent;
  
  const wilayaId = wilayaSelectElement.value;
  // change the color of the wilaya selected option
  wilayaSelectElement.style.color = 'var(--main-text-color)';
  // fetch communes
  const communes = await fetchCommunes(wilayaId);
  // Clear the communeSelect options
  communeSelectElement.innerHTML = '';
  
  // Add a placeholder option
  const placeholderOption = document.createElement('option');
  placeholderOption.value = ''; // Empty value
  placeholderOption.textContent = currentCommuneFormSelectorPlaceholder; // Prompt text
  placeholderOption.disabled = true; // Disable the option so it can't be selected
  placeholderOption.selected = true; // Make it the default selected option
  communeSelectElement.appendChild(placeholderOption);

  // Inject new communes options with commune-level prices
  communes.forEach(commune => {
    const option = document.createElement('option');
    option.value = commune.id;
    option.textContent = document.documentElement.lang === 'ar' ? commune.translations.ar : commune.name;
    if (commune.price != null) option.dataset.deliveryPrice = commune.price;
    if (commune.stop_desk_price != null) option.dataset.stopDeskPrice = commune.stop_desk_price;
    communeSelectElement.appendChild(option);
  });

  communeSelectElement.onchange = () => handleCommuneSelection(isBundle);
  // change the color of the commune selected option
  communeSelectElement.style.color = 'var(--main-text-color)';
}

// fetch communes
async function fetchCommunes(wilayaId){
  const landingPageId = document.querySelector('input[name="landing-page-id"]')?.value;
  let url = `${AYOR_URL}/api/states/${wilayaId}/cities/`;
  if (landingPageId) url += `?landing_page_id=${landingPageId}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// handle commune selection: update delivery price if commune has specific pricing
function handleCommuneSelection(isBundle = false) {
  const communeSelector = isBundle ? '#bundle-form select[name="bundle-commune"]' : 'select[name="commune"]';
  const wilayaSelector = isBundle ? '#bundle-form select[name="bundle-wilaya"]' : 'select[name="wilaya"]';
  const communeEl = document.querySelector(communeSelector);
  const wilayaEl = document.querySelector(wilayaSelector);

  const selected = communeEl.selectedOptions[0];
  const wilayaHome = +wilayaEl.selectedOptions[0].dataset.deliveryPrice || 0;
  const wilayaDesk = +wilayaEl.selectedOptions[0].dataset.stopDeskPrice || 0;

  const homePrice = selected?.dataset.deliveryPrice != null ? +selected.dataset.deliveryPrice : wilayaHome;
  const deskPrice = selected?.dataset.stopDeskPrice != null ? +selected.dataset.stopDeskPrice : wilayaDesk;

  updateDeliveryPrice(homePrice, isBundle);
  updateStopDeskPrice(deskPrice, isBundle);

  if (!hasOptions || (hasOptions && !selectedOption?.deliveryPrice)) {
    const price = isStopDesk ? deskPrice : homePrice;
    updateSummaryDeliveryPriceUI(price, isBundle);
    updateSummaryTotalPriceUI(isBundle);
  }

  communeEl.style.color = 'var(--main-text-color)';
}

// increse quantity
function increaseQuantity() {
  const orderQuantityValue = parseInt(orderQuantityElement.textContent);
  // update quantity UI
  orderQuantityElement.textContent = orderQuantityValue < MAX_SINGLE_DIGIT_NUMBER 
    ? `0${orderQuantityValue + 1}`
    : orderQuantityValue + 1;

  // update summary
  updateSummaryQuantityUI(orderQuantityValue + 1);
  updateSummaryTotalPriceUI();
}

// decrease quantity
function decreaseQuantity() {
  const orderQuantityValue = parseInt(orderQuantityElement.textContent);
  if (orderQuantityValue > MIN_QUANTITY) {
    orderQuantityElement.textContent = orderQuantityValue > MIN_DOUBLE_DIGIT_NUMBER 
      ? orderQuantityValue - 1 
      : `0${orderQuantityValue - 1}`;
  }
  // update summary
  if (orderQuantityValue > MIN_QUANTITY ) {
    updateSummaryQuantityUI(orderQuantityValue - 1);
    updateSummaryTotalPriceUI();

  }
}

function submitOrderForm(event) {
  event.preventDefault();
  if (isSubmitting) return;
  const landingPageId = document.querySelector('input[name="landing-page-id"]')?.value
  const fullName = document.querySelector('input[name="fullName"]');
  const phoneNumber = document.querySelector('input[name="phoneNumber"]');
  const wilaya = document.querySelector('select[name="wilaya"]');
  const commune = document.querySelector('select[name="commune"]');
  const email = document.querySelector('input[name="email"]');
  const address = document.querySelector('input[name="address"]');
  const zipCode = document.querySelector('input[name="zipCode"]');
  const orderQuantity = (!hasVariants && !hasOptions) ? parseInt(orderQuantityElement.textContent, 10): 1; // get single product quantity only if the product has no variants and no options
  let custom_data = []
  if (phoneNumber && phoneNumber.value) custom_data.push({value: phoneNumber.value,formField: 1})
  if (commune && commune.value) custom_data.push({value: commune.selectedOptions[0].textContent.trim(),formField: 2, item_id: commune.selectedOptions[0].value})
  if (wilaya && wilaya.value) custom_data.push({value: wilaya.selectedOptions[0].textContent.trim(), formField: 3, item_id: wilaya.selectedOptions[0].value})
  if (fullName && fullName.value) custom_data.push({value: fullName.value,formField: 4})
  if (email && email.value) custom_data.push({value: email.value,formField: 5})
  if (address && address.value) custom_data.push({value: address.value,formField: 7})
  if (zipCode && zipCode.value) custom_data.push({value: zipCode.value,formField: 8})
  
     // Handle custom fields
  const customFields = document.querySelectorAll('input[name^="custom-"]');
  if (customFields.length > 0) {
    customFields.forEach((field, _) => {
        if (field.value) {
            const customTitle = field.getAttribute('data-custom-title');
            custom_data.push({ value: field.value, formField: 6, custom_title: customTitle });
        }
    });
  }
  const turnstileToken = document.querySelector('input[name="cf-turnstile-response"]')?.value || "";
  createOrder({landing_page:landingPageId,shop:shopId,product: productId, custom_data, quantity: orderQuantity, isStopDesk, turnstileToken });
}
// create order
async function createOrder(
  { landing_page,shop, product, custom_data, quantity = 1, isStopDesk = false, turnstileToken },
) {
  const pixelEventId = crypto.randomUUID();
  currentPixelEventId = pixelEventId;

  let orderLines = [];
  let orderBody = {
    shop,
    landing_page,
    is_stop_desk: isStopDesk,
    custom_data,
    turnstile_token: turnstileToken,
    session_id: sessionId,
    source: detectVisitorSource(),
    pixel_event_id: pixelEventId
  };

  // Handle different product configurations
  if (isHybridMode) {
    // HYBRID MODE: Options + Variants    
    // Generate order lines from hybridData.variantList
    const hybridOrderLines = hybridData.variantList.map(variant => ({
      quantity: variant.quantity || 1,
      product_variant: variant.id
    }));
    
    orderLines = hybridOrderLines;
    
    // Add the selected option UUID for hybrid mode
    orderBody.variants_option_uuid = hybridData.selectedOption.id;
    
  } else if (hasVariants && !hasOptions) {
    // VARIANTS-ONLY MODE
    if (PRODUCT_VARIANTS && variantList.length !== 0) {
      orderLines = variantList.map(variant => ({
        quantity: variant.quantity,
        product_variant: variant.id
      }));
    }
    
  } else if (hasOptions && !hasVariants) {
    // OPTIONS-ONLY MODE
    orderLines = [{ 
      product, 
      quantity, 
      option_offer_uuid: selectedOption?.id 
    }];
    
  } else {
    // SIMPLE PRODUCT MODE
    orderLines = [{ product, quantity }];
  }

  // Add order_lines to the body
  orderBody.order_lines = orderLines;
  orderBody.payment_method = paymentMethod;

  const url = `${AYOR_URL}/api/create-public-order/`;
    const headers = {
      "Content-Type": "application/json",
    };

    const body = JSON.stringify(orderBody);
    isSubmitting = true;
    orderButton.disabled = true;
    const orderButtonText = orderButton.textContent;
    orderButton.innerHTML = `<div class="loader-spinner"></div>`;
    if (stickyBuyBtn) stickyBuyBtn.disabled = true;
    try {
      const fingerprint = await window.__getDeviceFingerprint();
      if (fingerprint) headers["X-Device"] = fingerprint;
      const response = await fetch(url, {
        method: "POST",
        headers,
        body,
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("maxOrdersReached");
        } else {
          throw new Error("orderCreationError");
        }
      }

      if (response.status === 201) {
        const responseData = await response.json();

      if (responseData.payment_response?.checkout_url) {
        saveSuccessPageData();
        window.location.href = responseData.payment_response.checkout_url;
      } else if (responseData.payment_response?.error) {
        throw new Error("orderCreationError");
      } else {
        redirectToThankYouPage();
      }
      }
    } catch (e) {
      if (e.message === "maxOrdersReached") {
        alert(getTranslation("maxOrdersReached"))
      } else {
        alert(getTranslation('orderCreationError'));
      }
      console.error("Error when creating order:", e);
    } finally {
      isSubmitting = false;
      orderButton.disabled = false;
      orderButton.innerHTML = orderButtonText;
      if (stickyBuyBtn) stickyBuyBtn.disabled = false;
    }
}

function updateStopDeskPrice(price, isBundle = false) {
  if (isBundle) {
    bundleStopdDeskDeliveryPrice = price;
  } else {
    stopdDeskDeliveryPrice = price;
  }
}

function updateDeliveryPrice(price, isBundle = false) {
  if (isBundle) {
    bundleDeliveryPrice = price;
  } else{
    deliveryPrice = price;
  }
}

function resetDeliveryType(isBundle = false) {
  const elementId = isBundle ? 'bundle-delivery-type' : 'delivery-type';
  const deliveryTypeElement = document.getElementById(elementId);
  if (!deliveryTypeElement) return;
  deliveryTypeElement.selectedIndex = 0;
  updateStopDesk(false, isBundle);
}

function updateStopDesk(value, isBundle = false) {
  if (isBundle) {
    isBundleStopDesk = value;
  } else {
    isStopDesk = value;
  }
}

// Function to set the regex pattern for the phone input
function setPhonePattern(countryCode) {
   // Regex map for phone numbers
   const phoneRegexMap = {
    DZ:  /^ *(0|\+ *2 *1 *3) *((5|6|7) *(\d *){8}|(4 *9|2 *7|2 *9|3 *2|3 *3|3 *4|2 *5|2 *6|3 *7|4 *3|4 *6|2 *1|2 *3|3 *6|4 *8|3 *8|3 *1|4 *5|3 *5|4 *1|2 *4) *(\d *){6}) *$/, // Algeria
    DEFAULT: /^\d{5,}$/, // Default regex for phone numbers with at least 5 digits
  };
  const phoneNumberInput = document.querySelector('input[name="phoneNumber"]');
  const bundlePhoneNumberInput = document.querySelector('input[name="bundle-phoneNumber"]');
  const regexPattern = phoneRegexMap[countryCode] || phoneRegexMap.DEFAULT;
  if (phoneNumberInput) phoneNumberInput.setAttribute('pattern', regexPattern.source);
  if (bundlePhoneNumberInput) bundlePhoneNumberInput.setAttribute('pattern', regexPattern.source);
}



// ============== end order form ==============

// ============= start order summary =============

function isWilayaSelected(isBundle = false) {
  const wilayaEl = document.querySelector(isBundle ? '#bundle-form select[name="bundle-wilaya"]' : 'select[name="wilaya"]');
  return Boolean(wilayaEl && wilayaEl.value);
}

function updateSummaryDeliveryPriceUI(newDeliveryPrice, isBundle = false) {
  const elementId = isBundle ? 'bundle-delivery-price' : 'delivery-price';
  const deliveryPriceElement = document.querySelector(`#${elementId}`);
  if (!deliveryPriceElement) return;

  const currencyElement = deliveryPriceElement.nextElementSibling;
  const hasOptionDeliveryOverride = typeof selectedOption !== 'undefined' && Boolean(selectedOption?.deliveryPrice);

  if (parseInt(newDeliveryPrice) === 0 && !isWilayaSelected(isBundle) && !hasOptionDeliveryOverride) {
    deliveryPriceElement.textContent = getTranslation('selectWilaya');
    deliveryPriceElement.style.cssText = 'color:#FFF;font-weight:600;background-color:var(--total-price);border-radius:5px;padding:4px;white-space:nowrap;display:inline-block;';
    if (currencyElement) currencyElement.style.display = 'none';
  } else {
    deliveryPriceElement.textContent = newDeliveryPrice;
    deliveryPriceElement.style.cssText = '';
    if (currencyElement) currencyElement.style.display = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  [false, true].forEach(isBundle => {
    const deliveryPriceElement = document.querySelector(isBundle ? '#bundle-delivery-price' : '#delivery-price');
    if (!deliveryPriceElement) return;
    if (parseInt(deliveryPriceElement.textContent) === 0 && !isWilayaSelected(isBundle)) {
      updateSummaryDeliveryPriceUI(0, isBundle);
    }
  });
});


function updateSummaryQuantityUI(newQuantity, isBundle = false) {
  const selector = isBundle ? '#bundle-summary-quantity' : '#summary-quantity';
  const summaryQuantityElement = document.querySelector(selector);
  if (summaryQuantityElement) summaryQuantityElement.textContent = `x${newQuantity}`;
}

function updateSummaryTotalPriceUI(isBundle = false) {
  const totalSummaryPriceElement = isBundle
    ? document.querySelector("#bundle-summary-total-price")
    : document.querySelector("#summary-total-price");

  const deliveryPriceElement = isBundle
    ? document.querySelector("#bundle-delivery-price")
    : document.querySelector("#delivery-price");

  const deliveryPriceValue = deliveryPriceElement ? parseInt(deliveryPriceElement.textContent) || 0 : 0;
  let totalPrice = 0;

  if (isBundle) {
    const orderQuantityValue = parseInt(bundleOrderQuantityElement.textContent);
    totalPrice = orderQuantityValue * bundlePrice;
  } else if (isHybridMode) {
    totalPrice = hybridData.selectedOption.reducedPrice ? parseInt(hybridData.selectedOption.reducedPrice) : parseInt(hybridData.selectedOption.price);
  } else if (hasOptions && !hasVariants) {
    totalPrice = parseInt(selectedOption.reducedPrice || selectedOption.price);
  } else if (hasVariants && !hasOptions) {
      totalPrice = variantList.reduce((acc, variant) => {
        return acc + (variant.reduced_price || variant.price) * variant.quantity;
      }, 0);
    } else {
      const orderQuantityValue = parseInt(orderQuantityElement.textContent);
      totalPrice = orderQuantityValue * priceValue;
  }

  const summaryTotalPrice = totalPrice + deliveryPriceValue;
  totalSummaryPriceElement.textContent = (summaryTotalPrice);
}

function updateButtonPriceUI(totalPrice, isBundle = false) {
  const buttonSelector = isBundle ? '#bundle-buy-btn .price' : '#buy-btn .price';
  const priceElement = document.querySelector(buttonSelector);

  if (priceElement) {
    priceElement.textContent = totalPrice;
  }
}
// ================== end order summary =============

//=========== start scroll to the top ============
const scrollToTopButton = document.querySelector(".top-scroll-btn");
scrollToTopButton.addEventListener("click", () => {
  scrollTo(0,0);
});
//=========== end scroll to the top ============

// ============= start pop up =============
const congratsButton = document.querySelector('#congrats-btn');
const congratsOverlay = document.querySelector('.congrats-overlay');

congratsButton.addEventListener('click', closeCongratsPopup);
congratsOverlay.addEventListener('click', closeCongratsPopupWithClickOutside);

function openCongratsPopup() {
    congratsOverlay.style.display = 'block';
}
function closeCongratsPopup() {
  congratsOverlay.style.display = 'none';
  const orderForm = document.querySelector('#order-form');
  orderForm.reset();
}
function closeCongratsPopupWithClickOutside(event) {
  if (event.target === congratsOverlay) {
    closeCongratsPopup();
  }
}

// ============= end pop up =============

// ============= start thank you page redirect =============
function saveSuccessPageData(isBundle = false) {
  const url = window.location.href
  const fbPixelId = document.querySelector('input[name="fb_id"]')?.value;
  const tkPixelId = document.querySelector('input[name="tk_id"]')?.value;
  const gtmId = document.querySelector('input[name="gtm_id"]')?.value;
  const successTitle = document.querySelector('input[name="success_title"]')?.value || ""
  const successMessage = document.querySelector('input[name="success_message"]')?.value || ""
  const goBackMessage = document.querySelector('input[name="goback_message"]')?.value || ""
  const logo = document.querySelector(".logo img").getAttribute("src")
  const fb = document.querySelector('input[name="facebook_url"]')?.value || ""
  const ig = document.querySelector('input[name="instagram_url"]')?.value || ""
  const tk = document.querySelector('input[name="tiktok_url"]')?.value || ""
  const copyright = document.querySelector('input[name="copyright_message"]')?.value || ""
  const primaryColor = window.getComputedStyle(orderButton).backgroundColor
  const productId = document.querySelector('input[name="product-id"]')?.value || ""
  const price = !isBundle 
    ? document.querySelector("#summary-total-price").textContent || productReducedPriceValue || productPriceValue 
    : document.querySelector("#bundle-summary-total-price").textContent || productReducedPriceValue || productPriceValue;
  const successPageData = {
    successTitle,
    successMessage,
    language,
    logo,
    fb,
    ig,
    tk,
    lp: url,
    primaryColor,
    price,
    copyright,
    goBackMessage,
    productId,
    fbPixelId,
    tkPixelId,
    gtmId,
    pixelEventId: currentPixelEventId
  }

  localStorage.setItem("sucessPageData", JSON.stringify(successPageData))
}

function redirectToThankYouPage(isBundle = false) {
  saveSuccessPageData(isBundle);

  const url = window.location.href
  const fbPixelId = document.querySelector('input[name="fb_id"]')?.value;
  const tkPixelId = document.querySelector('input[name="tk_id"]')?.value;
  const gtmId = document.querySelector('input[name="gtm_id"]')?.value;

  const lastSlashIndex = url.lastIndexOf("/");
  const newUrl = url.substring(0, lastSlashIndex + 1) + "thank-you" + 
  ((fbPixelId && fbPixelId !== "None") ? `?fb_id=${fbPixelId}` : "") + 
  ((tkPixelId && tkPixelId !== "None") ? `${(fbPixelId && fbPixelId !== "None") ? "&" : "?"}tk_id=${tkPixelId}` : "") +
  ((gtmId && gtmId !== "None") ? `${((fbPixelId && fbPixelId !== "None") || (tkPixelId && tkPixelId !== "None")) ? "&" : "?"}gtm_id=${gtmId}` : "");
  window.location.href = newUrl;
}
// ============= end thank you page redirect =============

// ============= copyright year =============
const yearElement = document.querySelector('.copyright span');
const currentYear = new Date().getFullYear();
if (yearElement) {
  yearElement.textContent = currentYear;
}
// ============= end copyright year =============
// ============= Translation =============
const translations = {
  en: {
    maxOrdersReached: "You have reached the maximum number of orders allowed. Please try again later or contact customer support for assistance.",
    orderCreationError: "An error occurred while creating your order. Please try again later. If the problem persists, contact customer support.",
    dzd: "dzd",
    selectWilaya: "Select a wilaya",
  },
  ar: {
    maxOrdersReached: "لقد وصلت إلى الحد الأقصى لعدد الطلبيات المسموح بها. يرجى المحاولة مرة أخرى لاحقًا أو الاتصال بدعم العملاء للحصول على المساعدة.",
    orderCreationError: "حدث خطأ أثناء إنشاء طلبك. يرجى المحاولة مرة أخرى لاحقًا. إذا استمرت المشكلة، يرجى الاتصال بدعم العملاء.",
    dzd: "دج",
    selectWilaya: "اختر الولاية",
  },
  fr: {
    maxOrdersReached: "Vous avez atteint le nombre maximum de commandes autorisées. Veuillez réessayer plus tard ou contacter le support client pour obtenir de l'aide.",
    orderCreationError: "Une erreur s'est produite lors de la création de votre commande. Veuillez réessayer plus tard. Si le problème persiste, contactez le support client.",
    dzd: "dzd",
    selectWilaya: "Choisissez la wilaya",
  }
};

function detectLanguage() {
  const lang = document.documentElement.lang || 'en';
  return lang;
}

function getTranslation(key) {
  const lang = detectLanguage();
  return translations[lang] && translations[lang][key] ? translations[lang][key] : translations['en'][key];
}

  // Detect the visitor source
  function detectVisitorSource() {
    const urlParams = new URLSearchParams(window.location.search);
    const referrer = document.referrer;
  
    // 1. Check for fbclid (used by both Facebook & Instagram)
    if (urlParams.has('fbclid')) {
        const utmSource = urlParams.get('utm_source');
        if (utmSource) {
            const lowerCaseSource = utmSource.toLowerCase();
            if (lowerCaseSource === 'ig') return 'instagram';  // Prioritize UTM source
            if (lowerCaseSource === 'fb') return 'facebook';    // Prioritize UTM source
        }
        // If no UTM source, fallback to referrer check
        if (referrer.includes('facebook.com')) return 'facebook';
        if (referrer.includes('instagram.com')) return 'instagram';
        return 'facebook';  // Default to Facebook if referrer is not available
    }
  
    // 2. Check for ttclid (TikTok) and scid (Snapchat)
    if (urlParams.has('ttclid')) return 'tiktok';
    if (urlParams.has('scid')) return 'snapchat';
  
    // 3. Check for UTM Parameters (full strings only)
    const utmSource = urlParams.get('utm_source');
    if (utmSource) {
        const lowerCaseSource = utmSource.toLowerCase();
        if (['facebook', 'instagram', 'tiktok', 'snapchat', 'ig', 'fb'].includes(lowerCaseSource)) {
            if (lowerCaseSource === 'ig') return 'instagram';
            if (lowerCaseSource === 'fb') return 'facebook';
            return lowerCaseSource;  // Accept only full strings for TikTok & Snapchat
        }
    }
  
    // 4. Check for Custom Query Parameters (only for Facebook & Instagram)
    const customSource = urlParams.get('src');
    if (customSource) {
        switch (customSource.toLowerCase()) {
            case 'fb': return 'facebook';
            case 'ig': return 'instagram';
        }
    }
  
    // 5. Check for HTTP Referrer (full strings only)
    if (referrer) {
        const referrerHost = new URL(referrer).hostname;
        if (referrerHost.includes('facebook.com')) return 'facebook';
        if (referrerHost.includes('instagram.com')) return 'instagram';
        if (referrerHost.includes('tiktok.com')) return 'tiktok';
        if (referrerHost.includes('snapchat.com')) return 'snapchat';
    }
  
    // Default to "other" if no source is detected
    return 'other';
  }


// Only initialize abandoned order tracking if enabled
const isAbandonedOrderEnabled = document.querySelector('input[name="is_abandoned_order_enabled"]').value.toLowerCase() === 'true';
if (isAbandonedOrderEnabled) {
  // Request Queue System
  const requestQueue = {
    queue: [],
    isProcessing: false,

    add: function(requestData) {
      this.queue.push(requestData);
      if (!this.isProcessing) {
        this.processNext();
      }
    },

    processNext: async function() {
      if (this.queue.length === 0) {
        this.isProcessing = false;
        return;
      }

      this.isProcessing = true;
      const nextRequest = this.queue.shift();
      
      try {
        await sendAbandonedOrderData(nextRequest);
      } catch (error) {
        console.error('Error processing request:', error);
      }

      // Process next item in queue
      this.processNext();
    }
  };

  // Add form field tracking
  const formFields = [
    'input[name="fullName"]',
    'input[name="phoneNumber"]',
    'select[name="wilaya"]',
    'select[name="commune"]',
    'input[name="email"]',
    'input[name="address"]',
    'input[name="zipCode"]',
  ].map(selector => document.querySelector(selector)).filter(Boolean);

  // Get custom fields separately
  const customFormFields = Array.from(document.querySelectorAll('input[name^="custom-"]'));

  // Add event listeners to regular form fields
  formFields.forEach(field => {
    field.addEventListener('change', () => {
      requestQueue.add(field.name);
    });
  });

  // Add event listeners to custom fields
  customFormFields.forEach(field => {
    field.addEventListener('change', () => {
      requestQueue.add(field.name);
    });
  });

  // Device type detection
  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "tablet";
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return "mobile";
    }
    return "desktop";
  }

  // Helper function to convert field names to human readable format
  function getReadableFieldName(fieldName, customTitle = '') {
    const fieldMap = {
      'phoneNumber': 'Phone Number',
      'fullName': 'Full Name',
      'wilaya': 'Wilaya',
      'commune': 'Commune',
      'email': 'Email',
      'address': 'Address',
      'zipCode': 'Zip Code',
    };

    if (fieldName.startsWith('custom-')) {
      return customTitle || 'Custom Field';
    }

    return fieldMap[fieldName] || fieldName;
  }

  // Helper function to map field names to form field IDs
  function getFormFieldId(fieldName) {
    const fieldMap = {
      'phoneNumber': 1,
      'commune': 2,
      'wilaya': 3,
      'fullName': 4,
      'email': 5,
      'address': 7,
      'zipCode': 8
    };
    
    if (fieldName.startsWith('custom-')) {
      return 6;
    }
    
    return fieldMap[fieldName] || 0;
  }

  // Mirror the order-creation payload shape so the backend can record what
  // variant(s) the customer was about to buy. Returns { order_lines?, variants_option_uuid? }
  // or {} when there's nothing to send. Backend treats the fields as optional.
  function buildAbandonedCartVariantPayload() {
    if (isHybridMode) {
      if (!hybridData?.variantList?.length || !hybridData?.selectedOption?.id) return {};
      return {
        order_lines: hybridData.variantList.map(variant => ({
          product_variant: variant.id,
          quantity: variant.quantity || 1,
        })),
        variants_option_uuid: hybridData.selectedOption.id,
      };
    }
    if (hasVariants && !hasOptions) {
      if (!PRODUCT_VARIANTS || !variantList?.length) return {};
      return {
        order_lines: variantList.map(variant => ({
          product_variant: variant.id,
          quantity: variant.quantity,
        })),
      };
    }
    return {};
  }

  // Update the sendAbandonedOrderData function to properly handle custom fields
  async function sendAbandonedOrderData(lastActionField) {
    const shopId = document.querySelector('input[name="shop-id"]')?.value;
    const landingPageId = document.querySelector('input[name="landing-page-id"]')?.value;

    // Retrieve stored page load time
    const pageLoadTime = sessionStorage.getItem('pageLoadTime');
    const requestTime = Date.now();

    // Calculate duration in seconds
    const durationSeconds = pageLoadTime ? Math.round((requestTime - pageLoadTime) / 1000) : 0;

    // Get all custom fields
    const customFields = document.querySelectorAll('input[name^="custom-"]');
    let custom_data = [];

    // Handle regular fields first
    formFields
      .filter(f => f.value && !f.name.startsWith('custom-'))
      .forEach(f => {
        const data = {
          value: f.type === 'select-one' ? f.selectedOptions[0].textContent.trim() : f.value,
          formField: getFormFieldId(f.name)
        };

        if (f.name === 'wilaya' || f.name === 'commune') {
          data.item_id = f.value;
        }

        custom_data.push(data);
      });

    // Handle custom fields separately
    customFields.forEach(field => {
      if (field.value) {
        const customTitle = field.getAttribute('data-custom-title');
        custom_data.push({
          value: field.value,
          formField: 6,
          custom_title: customTitle
        });
      }
    });

    const abandonedOrderData = {
      shop: shopId,
      landing_page: landingPageId,
      custom_data,
      source: detectVisitorSource(),
      last_action: getReadableFieldName(lastActionField, 
        document.querySelector(`[name="${lastActionField}"]`)?.getAttribute('data-custom-title')),
      device_type: getDeviceType(),
      session_id: sessionId,
      session_duration: durationSeconds,
      ...buildAbandonedCartVariantPayload(),
    };

    // Return a promise for the queue system
    return fetch(`${AYOR_URL}/api/abandoned-orders/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(abandonedOrderData)
    }).then(response => {
      if (!response.ok) {
        throw new Error('Failed to send abandoned order data');
      }
      return response;
    });
  }


}