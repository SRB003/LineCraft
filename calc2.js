$(function () {
    var annualDiscountRate = 5.5;
    var cumulativeCashFlow = 0;
    var estOEEInitialized = false;
    var curentoee = 0.7;

  
    $("#v-cost .ui-widget-content").slider({
      value:"55",
      range: "min",
      min: 0,
      max: 100,
      change: function (event, ui) {
        $("#variable").text(ui.value);
        calculateCostAndSubscription();
      },
    });
  
    $("#growth .ui-widget-content").slider({
      range: "min",
      min: 0,
      max: 100,
      change: function (event, ui) {
        $("#OEE-growth").text(ui.value);
       // estOEEInitialized = true;
        calculateCostAndSubscription();
      },
    });
    $("#submit2").on("click", function (event) {
      event.preventDefault();

      
      estOEEInitialized = true;

      
      calculateCostAndSubscription();
  });

  $("#refresh2").on("click", function () {
     
      location.reload();
  });

  $(document).ready(function () {
    $("#assets").on("input", function () {
        var value = $(this).val();
        if (value < 1 || value > 1000) {
            // If the entered value is outside the range, show a message and set it to the nearest limit
            alert("Please enter a value between 1 - 1000 for the number of machines.");
            value = Math.min(Math.max(value, 1), 1000);
            $(this).val(value);
        }
        calculateCostAndSubscription();
    });
});
$(document).ready(function () {
  $("#turnover").on("input", function () {
      var value = $(this).val();
      if (value < 1000000 || value > 500000000) {
          // If the entered value is outside the range, show a message and set it to the nearest limit
          alert("Please enter a value between $1000000 - $500000000 for the number of machines.");
          value = Math.min(Math.max(value, 1000000 ),  500000000);
          $(this).val(value);
      }
      calculateCostAndSubscription();
  });
});
    function calculateBreakevenDays(month, cumulativeCashFlow, previousCumulativeCashFlow) {
      if (cumulativeCashFlow > 0 && previousCumulativeCashFlow < 0) {
          // Corrected breakeven day calculation
          return Math.ceil(25 * ((month-1) - (previousCumulativeCashFlow / (cumulativeCashFlow - previousCumulativeCashFlow))));
      } else {
          return 0;
      }
  }
    function calculateCostAndSubscription() {
      if (!estOEEInitialized) {
        $("#profit").text("$0");
        $("#roi-1").text("0%");
        return;
      }
      var numberOfMachines = parseInt($("#assets").val(), 10);
      var TurnOver = parseInt($("#turnover").val());
     

      var oneTimeCost = Math.ceil(numberOfMachines / 20) * 50000;
      var yearlySubscription = numberOfMachines * 10000;
      var previousCumulativeCashFlow = 0;

  // run the loop till 50 month
      for (var month = 1; month <= 50; month++) {
        var Additionalprofit, mhrBenefit, discountedCashFlow, cost;
        var variablecost =
          parseFloat($("#v-cost .ui-widget-content").slider("value")) / 100;
        var growth =
          parseFloat($("#growth .ui-widget-content").slider("value")) / 100;
  
        if (month === 1) {
          Additionalprofit = 0;
          cost = oneTimeCost + yearlySubscription;
        } else if (month === 2) {
          Additionalprofit =
            ((((1 - variablecost) * TurnOver) / 12) * growth) / 3;
          cost = 0;
        } else if (month == 3) {
          Additionalprofit =
            ((((1 - variablecost) * TurnOver) / 12) * growth * 2) / 3;
          cost = 0;
        } else {
          Additionalprofit = (((1 - variablecost) * TurnOver) / 12) * growth;
          cost = 0;
        }
  
        discountedCashFlow =
          (Additionalprofit - cost) /
          Math.pow(1 + annualDiscountRate / 100 / 12, month - 1);
  
        if (month === 1) {
          cumulativeCashFlow = discountedCashFlow;
        } else {
          cumulativeCashFlow = previousMonthcost + discountedCashFlow;
        }


        var breakevenDays = calculateBreakevenDays(month, cumulativeCashFlow, previousCumulativeCashFlow);
           

        if (cumulativeCashFlow > 0 && previousCumulativeCashFlow < 0) {
            // Corrected breakeven day calculation
            console.log("Breakeven Days (Month " + month + "): " + breakevenDays.toFixed(2));
            var allInputsEntered = checkInputsEntered();
            if (allInputsEntered) {
                
                $("#breakeven2").text(breakevenDays +" "+ "days");

            } else {
                $("#breakeven2").text("0");
                         }
        } 

        //condition to display the 12 month calculation
        if (month === 12) {
        console.log("Month: " + month);
        console.log("Cost: " + cost);
        console.log("AditionalProfit : " + Additionalprofit);
        console.log("Discounted Cash Flow: " + discountedCashFlow.toFixed(8));
        console.log("Cumulative Cash Flow: " + cumulativeCashFlow.toFixed(2));
        var ROI = (cumulativeCashFlow / (oneTimeCost + yearlySubscription)) * 100;
        var targetoee = (curentoee*(1+growth))*100;
        console.log(ROI);
        console.log(targetoee);
        var allInputsEntered = checkInputsEntered();
    
        if (allInputsEntered) {
          cumulativeCashFlow ;
          var AdditionalTurnOver = cumulativeCashFlow;
          if (AdditionalTurnOver < 0) {
            alert("This scenario does not lead to any savings within one year");
             $("#roi-1").text("0%");
             $("#target-roi").text("0%");

         } else {
          $("#profit").text(
            "$" +
              AdditionalTurnOver.toFixed(0)
                .toLocaleString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          );
          $("#roi-1").text(ROI.toFixed(0) + "%");
          $("#target-roi").text(targetoee.toFixed(0) + "%");
         }

          
        } else {
          $("#profit").text("$0");
          $("#roi-1").text("0%");
          $("#target-roi").text("0%");
        }
    }
        previousMonthcost = cumulativeCashFlow;   
        previousCumulativeCashFlow = cumulativeCashFlow;  
      } 
      
      
    }
    function checkInputsEntered() {
      var numberOfMachines = $("#assets").val();
      var machineCost = $("#turnover").val();
  
      var OEE = $("#variable").text();
      var estOEE = $("#OEE-growth").text();
  
      return numberOfMachines && machineCost && OEE && estOEE;
    }
  
    $("#assets").on("input", calculateCostAndSubscription);
  });
