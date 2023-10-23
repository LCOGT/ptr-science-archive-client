import $ from 'jquery';
import 'jquery-file-download';

export { downloadZip, downloadWget, downloadFrameNum, downloadFrameNumSageMaker };

function downloadZip(frameIds, uncompress, catalog, archiveRoot, archiveToken) {
  let postData = {};

  frameIds.forEach(function(value, i) {
    postData[`frame_ids[${i}]`] = value;
  });
  postData['auth_token'] = archiveToken;
  postData['uncompress'] = uncompress;
  postData['catalog_only'] = catalog;

  $.fileDownload(`${archiveRoot}/frames/zip/`, {
    httpMethod: 'POST',
    data: postData
  });
}

function generateScript(frameIds, archiveToken, archiveRoot, callback) {
  $.get('scripts/download_script.sh', function(data) {
    var res = data.replace('FRAMELIST', frameIds.join(' '));
    if (archiveToken != null) {
      res = res.replace('AUTHTOKEN', archiveToken);
    }
    res = res.replace('ARCHIVEFRAMEURL', `${archiveRoot}/frames/`);
    callback(res);
  });
}

function downloadWget(frameIds, archiveToken, archiveRoot) {
  generateScript(frameIds, archiveToken, archiveRoot, function(data) {
    var a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([data], {type: 'text/plain'}));
    a.download = 'archivedownload.sh';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

function copytoClipboardScript(frameIds, callback) {
  //$.execCommand("copy"), function(data) {
  $.get('scripts/download_scriptframenum.sh', function(data) {
    var res = data.replace('FRAMELIST', frameIds.join(','));
    //if (archiveToken != null) {
    //  res = res.replace('AUTHTOKEN', archiveToken);
    //}
    //res = res.replace('ARCHIVEFRAMEURL', `${archiveRoot}/frames/`);
    callback(res);
  });
}

function downloadFrameNum(frameIds) {
  copytoClipboardScript(frameIds, async function(data) {
    var a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([data], {type: 'text/csv'}));
    a.download = 'framenumbers.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    navigator.clipboard.writeText(data);
    setTimeout(() => {
    alert("Copied the below frames to clipboard" + "\n" + data + "\n" + "Click OK to confirm")}, 0);
  });
}


function downloadFrameNumSageMaker(frameIds) {
  copytoClipboardScript(frameIds, async function(data) {
    // Create a custom modal dialog
    const backgroundModal = document.createElement("div");
    backgroundModal.style.position = "fixed";
    backgroundModal.style.top = "0";
    backgroundModal.style.left = "0";
    backgroundModal.style.width = "100%";
    backgroundModal.style.height = "100%";
    backgroundModal.style.backgroundColor = "rgba(0, 0, 0, 0.65)"; // Background dimming by 0.5
    backgroundModal.style.zIndex = "9998"; // Set a z-index value

    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "50%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)"; // Center the modal
    modal.style.width = "50%";
    modal.style.height = "50%";
    modal.style.backgroundColor = "rgba(0, 0, 0, 0.8)"; // Top layer dimming by 0.8
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.flexDirection = "column"; // Display elements vertically
    modal.style.zIndex = "9999"; // Set a high z-index value

    // Create a close button (cross button) for the top layer
    const closeButton = document.createElement("button");
    closeButton.innerHTML = "&#10006;"; // Unicode character for '✖'
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.border = "none";
    closeButton.style.fontSize = "20px";
    closeButton.style.cursor = "pointer";
    closeButton.style.color = "white"; // Set the color

    // Function to close the modals
    const closeModal = () => {
      backgroundModal.style.display = "none";
      modal.style.display = "none";
    };

    // Event listeners for close button and ESC key
    closeButton.addEventListener("click", closeModal);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    });

    // Text instructions for the top layer
    const instructions = document.createElement("p");
    instructions.textContent = "Please enter a folder name to save the files to, and click copy to clipboard to generate the code for SageMaker.";
    instructions.style.marginBottom = "30px";
    instructions.style.width = "300px";
    instructions.style.textAlign = "center";
    instructions.style.color = "white"; // Set the color

    // Create a container for text entry and button for the top layer
    const entryContainer = document.createElement("div");
    entryContainer.style.display = "flex";
    entryContainer.style.flexDirection = "column";

    // Create a label for the folder name
    //const label = document.createElement("label");
    //label.textContent = "Enter folder name:";
    //label.style.marginBottom = "5px";
    //label.style.color = "blue"; // Set the color

    // Create an input field for folder name
    const folderNameInput = document.createElement("input");
    folderNameInput.placeholder = "Enter folder name";
    folderNameInput.style.marginBottom = "30px";
    folderNameInput.style.padding = "5px";

    // Create a "Copy to Clipboard" button
    const copyButton = document.createElement("button");
    copyButton.textContent = "Copy to Clipboard";
    copyButton.style.padding = "10px";
    copyButton.style.display = "block";
    copyButton.style.backgroundColor = "#013185";
    copyButton.style.color = "white";
    copyButton.style.border = "1px solid #ffffff";

    // Function to copy code to clipboard
    const copyToClipboard = async () => {
      const folderName = folderNameInput.value.trim();

      if (folderName) {
        // Remove line breaks from the data variable
        data = data.replace(/\n/g, '');

        // Generate the code with the user-provided folder name
        const code = `ptrsagemaker.download_frames_from_ptrarchive(location='${folderName}', frames='${data}')`;

        try {
          await navigator.clipboard.writeText(code);
          alert("The below code has been copied to clipboard" +  "\n" + "\n" + code);
          closeModal(); // Close the modals after copying
        } catch (err) {
          console.error("Clipboard write failed:", err);
        }
      } else {
        alert("Please enter a folder name.");
      }
    };

    // Event listener for "Copy to Clipboard" button
    copyButton.addEventListener("click", copyToClipboard);

    // Append elements to the top layer modal
    modal.appendChild(closeButton);
    modal.appendChild(instructions);
    //entryContainer.appendChild(label);
    entryContainer.appendChild(folderNameInput);
    entryContainer.appendChild(copyButton);
    modal.appendChild(entryContainer);

    // Append the top layer modal to the body
    document.body.appendChild(modal);

    // Append the background dimming layer to the body
    document.body.appendChild(backgroundModal);
  });
}

