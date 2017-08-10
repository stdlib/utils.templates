window.addEventListener('DOMContentLoaded', function() {

  var products = [].slice.call(document.querySelectorAll('.product'));

  var dialogLoading = document.querySelector('.modal[name="loading"]');
  var dialogComplete = document.querySelector('.modal[name="complete"]');

  dialogComplete.addEventListener('click', function () {
    dialogComplete.style.display = 'none';
  });

  function startLoading() {
    dialogLoading.style.display = 'block';
  }

  function endLoading() {
    dialogLoading.style.display = 'none';
  }

  function completeOrder(name) {
    dialogComplete.querySelector('[name="product-name"]').innerText = name;
    dialogComplete.style.display = 'block';
  }

  products.forEach(function (product) {

    var id = product.getAttribute('data-id');
    var name = product.getAttribute('data-name');
    var description = product.getAttribute('data-description');
    var shippable = !!parseInt(product.getAttribute('data-shippable'));

    var image = product.querySelector('div.image');

    var skuSelector = product.querySelector('select[name="sku"]');
    var orderButton = product.querySelector('button[name="order"]');

    skuSelector.addEventListener('change', function () {

      image.style.backgroundImage = 'url(\'' +
        (skuSelector.value.split(',')[2] || image.getAttribute('data-default')) +
        '\')';

    });

    orderButton.addEventListener('click', function () {

      var skuData = skuSelector.value.split(',');
      var skuId = skuData[0];
      var skuPrice = parseInt(skuData[1]);

      stripeHandler.open({
        name: name,
        description: description,
        amount: skuPrice,
        billingAddress: shippable,
        shippingAddress: shippable,
        locale: 'auto',
        zipCode: true,
        token: function (stripeToken, shippingInfo) {

          startLoading();

          lib(GLOBALS.SERVICE_PATH + '.order')({
            skuId: skuId,
            stripeToken: stripeToken,
            shippingInfo: shippingInfo
          }, function (err, result) {

            endLoading();

            if (err) {
              alert(err.message);
              return;
            }

            completeOrder(name);

          });

        }
      });

    });

  });

});
