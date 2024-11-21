<script>
    let result = "";
    let buttons = ["1", "2", "3", "C", "4", "5", "6", "+", "7", "8", "9", "-", "0", "="];   
    function btnClick(button) {
        switch (button) {
            case "C":
                result = "";
                break;
            case "=":
                if (result[result.length -1] == "+" || result[result.length -1] == "-") {
                    result = result.slice(0, -1);
                }
                try {
                    result = eval(result);
                } catch (e) {
                    result = "Ошибка";
                }
                break;
            case "+":
                if ((result[result.length -1] == "+" || result[result.length -1] == "-")) {
                    result = result;
                } else {
                    result += button;
                }
                break;
            case "-":
                if ((result[result.length -1] == "+" || result[result.length -1] == "-")) {
                    result = result;
                } else {
                    result += button;
                }
                break;
            default:
                result += button;
        }
    }
</script>

<body>
    <div class="calculator">
        <section class="InfoPanel">
            <p class="show-result">{result}</p>
        </section>
        <section class="ControlPanel">
            {#each buttons as button} 
                {#if button == "+" || button == "-" || button == "=" || button == "C"}
                    <button class="operations btn" on:click={() => btnClick(button)}>{button}</button>
                {:else}
                <button class="btn" on:click={() => btnClick(button)}>
                    {button}
                </button>
                {/if}
            {/each} 
        </section>  
    </div>
</body>





<style>
    body {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }
    .calculator {
        display: grid;
        max-width: 265px;
        background-color: #000;
        border-radius: 10px;
        /* grid-template-columns: 4;    */
        /* grid-template-rows: 4; */
    }
    .ControlPanel {
        padding-left: 13px;
        padding-bottom: 13px;
    }
    .operations {
        background-color: #ee982f;
    }
    
    .InfoPanel {
        padding-left: 15px;
        padding-right: 15px;
        display: flex;
        justify-content: flex-end;
        font-size: 30px;
    }

    .show-result {
        margin: 3px 3px;
        color: #fff;
        padding-top: 7px;
        padding-bottom: 7px;
    }
    
    button {
        height: 50px;
        width: 50px;
        padding: 10px;
        font-size: 1.7em;
        margin: 5px;
        border-width: 0px;
        border-radius: 10px;
        background-color: #876740;
        color: #fff;
    }
    .btn:hover {
        transform: scale(1.1);
        background: linear-gradient(45deg, #ff6b6b, #f06595);
        color: white;
        cursor: pointer;
    }
        
</style>

