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
    // Prompt the user to input a folder name
    const folderName = prompt("Please enter a folder name to save the files to:");

    if (folderName) {
      // Remove line breaks from the data variable
      data = data.replace(/\n/g, '');

      // Generate the code with the user-provided folder name
      const code = `ptrsagemaker.download_frames_from_ptrarchive(location='${folderName}', frames='${data}')`;

      // Copy the code to the clipboard
      navigator.clipboard.writeText(code);

      setTimeout(() => {
        alert("The below code has been generated for SageMaker to download files." + "\n" + "\n" + "Click OK to copy the code to clipboard" + "\n" + `Folder name: ${folderName}` + "\n" + "\n" + code);
      }, 0);
    }
  });
}
