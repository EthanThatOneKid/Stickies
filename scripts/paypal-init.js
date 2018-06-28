// Additional Panels
paypal.Button.render({
  env: "sandbox", // Specify "sandbox" for the test environment
  payment: (data, actions) => {
    return actions.payment.create({
      transactions: [{
        amount: {
          total: "1.00",
          currency: "USD"
        }
      }]
    });
  },
  onAuthorize: (data, actions) => {
    return actions.payment.execute().then(() => {
      window.alert("Thank you for your purchase!");
      // add 5 more panels to user's maxPanels
    });
  },
  onCancel: function (data, actions) {
    // Show a cancel page or return to cart
  }
}, "#buyPanelsBtn");
