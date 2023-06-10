import $ from 'jquery';
import 'jquery-file-download';

export { downloadZip, downloadWget, downloadFrameNum };

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
    var res = data.replace('FRAMELIST', frameIds.join('\n'));
    //if (archiveToken != null) {
    //  res = res.replace('AUTHTOKEN', archiveToken);
    //}
    //res = res.replace('ARCHIVEFRAMEURL', `${archiveRoot}/frames/`);
    callback(res);
  });
}

function downloadFrameNum(frameIds) {
  copytoClipboardScript(frameIds, function(data) {
    navigator.clipboard.writeText(data);
    alert("Copied the below frames to clipboard" + "\n" + data);
    var a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([data], {type: 'text/plain'}));
    a.download = 'framenumbers.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
  });
}
