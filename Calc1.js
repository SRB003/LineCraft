$(function () {
  var annualDiscountRate = 5.5;
  var cumulativeCashFlow = 0;
  var previousMonthOEE;
  var estOEEInitialized = false;

  $(
    "#w-node-_9fa2d9ba-0894-b419-ff8f-e31a3953546b-4360c73e .ui-widget-content"
  ).slider({
    range: "min",
    min: 1,
    max: 30,
    slide: function (event, ui) {
      $("#days").text(ui.value);
      calculateCostAndSubscription();
    },
  });

  $(
    "#w-node-_09480e99-58d2-0fb9-83f3-76b815703657-4360c73e .ui-widget-content"
  ).slider({
    range: "min",
    min: 1,
    max: 24,
    slide: function (event, ui) {
      $("#hrs").text(ui.value);
      calculateCostAndSubscription();
    },
  });

  $(
    "#w-node-ff05e759-9986-1567-b119-a92609867deb-4360c73e .ui-widget-content"
  ).slider({
    range: "min",
    min: 0,
    max: 100,
    slide: function (event, ui) {
      $("#OEE").text(ui.value);
      calculateCostAndSubscription();
    },
  });

  $(
    "#w-node-_0175c10d-b0b6-597e-04e5-d065d3ca367f-4360c73e .ui-widget-content"
  ).slider({
    range: "min",
    min: 0,
    max: 100,
    slide: function (event, ui) {
      $("#est-OEE").text(ui.value);
      estOEEInitialized = true;
      calculateCostAndSubscription();
    },
  });

  function calculateCostAndSubscription() {
    if (!estOEEInitialized) {
      $("#savings").text("$0");
      $("#roi").text("0%");
      return;
    }
    var numberOfMachines = parseInt($("#machines").val(), 10);
    var oneTimeCost = Math.ceil(numberOfMachines / 20) * 10000;
    var yearlySubscription = numberOfMachines * 10000;

    for (var month = 1; month <= 12; month++) {
      var oeePercentage, mhrBenefit, discountedCashFlow, cost;

      if (month === 1) {
        oeePercentage = parseFloat($("#OEE").text()) / 100;
        cost = oneTimeCost + yearlySubscription;
      } else if (month === 2) {
        var estOEE =
          parseFloat(
            $(
              "#w-node-_0175c10d-b0b6-597e-04e5-d065d3ca367f-4360c73e .ui-widget-content"
            ).slider("value")
          ) / 100;
        oeePercentage = oeePercentage * (1 + estOEE / 3);
        cost = 0;
      } else if (month >= 3 && month <= 4) {
        var estOEE =
          parseFloat(
            $(
              "#w-node-_0175c10d-b0b6-597e-04e5-d065d3ca367f-4360c73e .ui-widget-content"
            ).slider("value")
          ) / 100;
        oeePercentage = previousMonthOEE * (1 + estOEE / 3);
        cost = 0;
      } else {
        oeePercentage = previousMonthOEE;
        cost = 0;
      }

      mhrBenefit =
        (oeePercentage - parseFloat($("#OEE").text()) / 100) *
        (numberOfMachines *
          parseFloat($("#days").text()) *
          parseFloat($("#hrs").text()) *
          parseFloat($("#machine-cost").val()));

      if (month === 1) {
        discountedCashFlow = mhrBenefit - cost;
        cumulativeCashFlow = discountedCashFlow;
      } else {
        discountedCashFlow =
          mhrBenefit / Math.pow(1 + annualDiscountRate / 100 / 12, month - 1);
        cumulativeCashFlow = previousMonthcost + discountedCashFlow;
      }

      console.log("Month: " + month);
      console.log("Cost: " + cost);
      console.log("OEE Percentage: " + oeePercentage);
      console.log("MHR Benefit: " + mhrBenefit.toFixed(2));
      console.log("Discounted Cash Flow: " + discountedCashFlow.toFixed(2));
      console.log("Cumulative Cash Flow: " + cumulativeCashFlow.toFixed(2));

      previousMonthOEE = oeePercentage;
      previousMonthcost = cumulativeCashFlow;
    }

    var ROI = (cumulativeCashFlow / (oneTimeCost + yearlySubscription)) * 100;
    var allInputsEntered = checkInputsEntered();

    if (allInputsEntered) {
      $("#savings").text(
        "$" +
          cumulativeCashFlow
            .toFixed(0)
            .toLocaleString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      );
      $("#roi").text(ROI.toFixed(0) + "%");
    } else {
      $("#savings").text("$0");
      $("#roi").text("0%");
    }
    /* console.log(ROI);
        // Display cumulative cash flow after all iterations
        $("#savings").text("$"+cumulativeCashFlow.toFixed(0).toLocaleString());
        $("#roi").text(ROI.toFixed(0)+"%");*/
  }
  function checkInputsEntered() {
    var numberOfMachines = $("#machines").val();
    var machineCost = $("#machine-cost").val();
    var days = $("#days").text();
    var hrs = $("#hrs").text();
    var OEE = $("#OEE").text();
    var estOEE = $("#est-OEE").text();

    return numberOfMachines && machineCost && days && hrs && OEE && estOEE;
  }

  $("#machines").on("input", calculateCostAndSubscription);
});
