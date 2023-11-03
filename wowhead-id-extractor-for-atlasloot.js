// ==UserScript==
// @name         Item Ids Extractor Wowhead
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  The script adds a button to the bis list gear planner module that shows/hides a textarea containing all the ids of the shown gear in planner. You can copy and paste the textarea content into an atlasloot favourites item list.
// @author       Clvd0x
// @match        https://www.wowhead.com/wotlk/guide/classes/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wowhead.com
// @grant        none
// @updateURL    https://github.com/Clvd0x/Tampermonkey-Scripts/raw/main/wowhead-id-extractor-for-atlasloot.js
// @downloadURL  https://github.com/Clvd0x/Tampermonkey-Scripts/raw/main/wowhead-id-extractor-for-atlasloot.js
// ==/UserScript==

(function() {
    'use strict';
    init()
})();

function init(){

    function addButtonToContainer(el, idx) {
        const newButton = document.createElement('button');
        newButton.className = 'btn btn-small';
        newButton.style = "margin-left:5px;float:right"
        newButton.textContent = 'Show Ids';
        newButton.addEventListener('click', function () {
            const textarea = document.getElementById(String(idx +'-ids-textarea'));
            if (textarea.style.display === 'none') {
                textarea.style.display = 'block';
            } else {
                textarea.style.display = 'none';
            }
        });
        const buttonContainer = el.querySelector('.gear-planner-slots-controls-buttons');
        if (buttonContainer) {
            buttonContainer.appendChild(newButton);
        }
    }

    function addTextfieldToContainer(el,idx) {
        let textareaContainer = document.createElement('div');
        textareaContainer.className = 'textarea-container';

        let textarea = document.createElement('textarea');
        textarea.id = String(idx + '-ids-textarea');
        textarea.style.display = 'none';
        textarea.style.margin = '0 auto 20px';// Anfangs verstecken
        textarea.style.height = "60px"
        textarea.style.width = "600px"
        textareaContainer.appendChild(textarea);

        el.insertBefore(textareaContainer, el.firstChild)
        return textarea
    }

    function extractItemNumber(link) {
        var match = link.match(/item=(\d+)/);
        if (match && match[1]) {
            return match[1];
        }
        return null;
    }

    function extractListNumber(id) {
        const match = id.match(/markup-gear-planner-calc-(\d+)/);
        if (match && match[1]) {
            const idx = parseInt(match[1], 10);
            return match[1];
        }
        return -1;
    }

    function populateTextArea(el, textArea){
        let gearSlots = el.querySelectorAll('.gear-planner-slots-group-slot .iconlarge a[aria-label="Icon"][href^="https://www.wowhead.com/wotlk/item="]')
        gearSlots.forEach(slot => {
            const num = extractItemNumber(slot.href)
            if(num) {
                textArea.value += String("i:" +num + ",")
            }
        })
    }

    let initList = []
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {

            if(mutation.target.id.startsWith("markup-gear-planner-calc-")) {
                let idx = extractListNumber(mutation.target.id)

                if(idx == -1 || initList[idx]) {
                    return
                }

                addButtonToContainer(mutation.target,idx);
                const textarea = addTextfieldToContainer(mutation.target,idx)
                populateTextArea(mutation.target,textarea)
                initList[idx] = true
            }

        });

    });

    observer.observe(document.body, { childList: true, subtree: true });
}
