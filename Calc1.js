$(function () {
    var annualDiscountRate = 5.5;
    var cumulativeCashFlow = 0;
    var previousMonthOEE;
    var estOEEInitialized = false;
    var previousMonthcost = 0;

    $("#w-node-_9fa2d9ba-0894-b419-ff8f-e31a3953546b-4360c73e .ui-widget-content").slider({
        value :25,
        range: "min",
        min: 1,
        max: 31,
        change: function (event, ui) {
            $("#days").text(ui.value);
            calculateCostAndSubscription();
        },
    });

    $("#w-node-_09480e99-58d2-0fb9-83f3-76b815703657-4360c73e .ui-widget-content").slider({
         value :"16",
        range: "min",
        min: 1,
        max: 24,
        change: function (event, ui) {
            $("#hrs").text(ui.value);
            calculateCostAndSubscription();
        },
    });

    $("#w-node-ff05e759-9986-1567-b119-a92609867deb-4360c73e .ui-widget-content").slider({
         value :"60",
        range: "min",
        min: 1,
        max: 100,
        change: function (event, ui) {
            $("#OEE").text(ui.value);
            calculateCostAndSubscription();
        },
    });

    $("#w-node-_0175c10d-b0b6-597e-04e5-d065d3ca367f-4360c73e .ui-widget-content").slider({
         value :"10",
        range: "min",
        min: 1,
        max: 50,
        change: function (event, ui) {
            $("#est-OEE").text(ui.value);
          
            calculateCostAndSubscription();
        },
    });
    $("#submit").on("click", function (event) {
        event.preventDefault();

     
        estOEEInitialized = true;

       
        calculateCostAndSubscription();
    });

    $("#refresh").on("click", function () {
      
        location.reload();
    });
$(document).ready(function () {
        $("#machines").on("input", function () {
            var value = $(this).val();
            if (value < 1 || value > 1000) {
              
                alert("Please enter a value between 1 - 1000 for the number of machines.");
                value = Math.min(Math.max(value, 1), 1000);
                $(this).val(value);
            }
            calculateCostAndSubscription();
        });
    });
    $(document).ready(function () {
        $("#machine-cost").on("input", function () {
            var value = $(this).val();
            if (value < 1 || value > 5000) {
                
                alert("Please enter a value between $1 - $5000 for the number of machines.");
                value = Math.min(Math.max(value, 1), 5000);
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
            $("#savings").text("$0");
            $("#roi").text("0%");
            return;
        }

        var numberOfMachines = parseInt($("#machines").val(), 10);
        var oneTimeCost = Math.ceil(numberOfMachines / 20) * 50000;
        var yearlySubscription = numberOfMachines * 10000;

        var previousCumulativeCashFlow = 0;

        for (var month = 1; month <= 50; month++) {
            var oeePercentage, mhrBenefit, discountedCashFlow, cost;

            if (month === 1) {
                oeePercentage = parseFloat($("#OEE").text()) / 100;
                cost = oneTimeCost + yearlySubscription;
            } else if (month === 2) {
                var estOEE =
                    parseFloat(
                        $("#w-node-_0175c10d-b0b6-597e-04e5-d065d3ca367f-4360c73e .ui-widget-content").slider("value")
                    ) / 100;
                oeePercentage = oeePercentage * (1 + estOEE / 3);
                cost = 0;
            } else if (month >= 3 && month <= 4) {
                var estOEE =
                    parseFloat(
                        $("#w-node-_0175c10d-b0b6-597e-04e5-d065d3ca367f-4360c73e .ui-widget-content").slider("value")
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

            var breakevenDays = calculateBreakevenDays(month, cumulativeCashFlow, previousCumulativeCashFlow);
           

            if (cumulativeCashFlow > 0 && previousCumulativeCashFlow < 0) {
                // Corrected breakeven day calculation
                console.log("Breakeven Days (Month " + month + "): " + breakevenDays);
                var allInputsEntered = checkInputsEntered();
                if (allInputsEntered) {
                    
                    $("#breakeven").text(breakevenDays +" "+ "Days");

                } else {
                    $("#breakeven").text("0");
                             }
            } 
           

            if (month === 12) {
                console.log("Month: " + month);
                console.log("Cost: " + cost);
                console.log("OEE Percentage: " + oeePercentage);
                console.log("MHR Benefit: " + mhrBenefit.toFixed(2));
                console.log("Discounted Cash Flow: " + discountedCashFlow.toFixed(2));
                console.log("Cumulative Cash Flow: " + cumulativeCashFlow.toFixed(2));

                var ROI = (cumulativeCashFlow / (oneTimeCost + yearlySubscription)) * 100;
                var allInputsEntered = checkInputsEntered();

                if (allInputsEntered) {
                    if (cumulativeCashFlow < 0) {
                       alert("This scenario does not lead to any savings within one year");
                        $("#roi").text("0%");
                    } else {
                        $("#savings").text(
                            "$" +
                            cumulativeCashFlow
                                .toFixed(0)
                                .toLocaleString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        );
                        $("#roi").text(ROI.toFixed(0) + "%");
                    }

                } else {
                    $("#savings").text("$0");
                    $("#roi").text("0%");

                }
            }

            previousMonthOEE = oeePercentage;
            previousMonthcost = cumulativeCashFlow;
            previousCumulativeCashFlow = cumulativeCashFlow;
        }
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
