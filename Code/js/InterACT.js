/*
InterACT.js, an on the fly, in browser video concenation javascript.
Copyright (C) 2016  Andrew Neudegg

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
/*


/*
 *   Preamble Check
 */

// Prevent unworkable situation:
window.MediaSource = window.MediaSource || window.WebKitMediaSource;
if (!!!window.MediaSource) {
    alert('MediaSource API is not available');
}


/*
 *   Global Variables
 */


// The frequency to load new chunks in MS.
var rechunkUpdateIntervalMS = 250;

// The media item.
var video = document.querySelector('video');

// The media source responsible for handling the video functionality.
var mediaSource = new MediaSource();

// Assign video.
video.src = window.URL.createObjectURL(mediaSource);


// This variable represents the file access points.
var totalValidEntryPoints = 48;

var fileBinaryIdentifiers =
[
    { file: 'video.webm', offset: 0, size: 326, timecode: 0.000000 },
    { file: 'video.webm', offset: 326, size: 15159, timecode: 0.000000 },
    { file: 'video.webm', offset: 15485, size: 8234, timecode: 0.400000 },
    { file: 'video.webm', offset: 23719, size: 5807, timecode: 0.800000 },
    { file: 'video.webm', offset: 29526, size: 6818, timecode: 0.920000 },
    { file: 'video.webm', offset: 36344, size: 9410, timecode: 1.320000 },
    { file: 'video.webm', offset: 45754, size: 6869, timecode: 1.720000 },
    { file: 'video.webm', offset: 52623, size: 8668, timecode: 1.920000 },
    { file: 'video.webm', offset: 61291, size: 9486, timecode: 2.320000 },
    { file: 'video.webm', offset: 70777, size: 7190, timecode: 2.720000 },
    { file: 'video.webm', offset: 77967, size: 8783, timecode: 2.920000 },
    { file: 'video.webm', offset: 86750, size: 2874, timecode: 3.320000 },
    { file: 'video.webm', offset: 89624, size: 1225, timecode: 3.720000 },
    { file: 'video.webm', offset: 90849, size: 1225, timecode: 4.120000 },
    { file: 'video.webm', offset: 92074, size: 2239, timecode: 4.520000 },
    { file: 'video.webm', offset: 94313, size: 8794, timecode: 4.920000 },
    { file: 'video.webm', offset: 103107, size: 11116, timecode: 5.320000 },
    { file: 'video.webm', offset: 114223, size: 3747, timecode: 5.720000 },
    { file: 'video.webm', offset: 117970, size: 17639, timecode: 5.800000 },
    { file: 'video.webm', offset: 135609, size: 18956, timecode: 6.200000 },
    { file: 'video.webm', offset: 154565, size: 7917, timecode: 6.600000 },
    { file: 'video.webm', offset: 162482, size: 14038, timecode: 6.720000 },
    { file: 'video.webm', offset: 176520, size: 12121, timecode: 7.120000 },
    { file: 'video.webm', offset: 188641, size: 7747, timecode: 7.520000 },
    { file: 'video.webm', offset: 196388, size: 10727, timecode: 7.720000 },
    { file: 'video.webm', offset: 207115, size: 11891, timecode: 8.120000 },
    { file: 'video.webm', offset: 219006, size: 7781, timecode: 8.520000 },
    { file: 'video.webm', offset: 226787, size: 7549, timecode: 8.720000 },
    { file: 'video.webm', offset: 234336, size: 4847, timecode: 9.120000 },
    { file: 'video.webm', offset: 239183, size: 1224, timecode: 9.520000 },
    { file: 'video.webm', offset: 240407, size: 1224, timecode: 9.920000 },
    { file: 'video.webm', offset: 241631, size: 1655, timecode: 10.320000 },
    { file: 'video.webm', offset: 243286, size: 7349, timecode: 10.720000 },
    { file: 'video.webm', offset: 250635, size: 9037, timecode: 11.120000 },
    { file: 'video.webm', offset: 259672, size: 3572, timecode: 11.520000 },
    { file: 'video.webm', offset: 263244, size: 19686, timecode: 11.640000 },
    { file: 'video.webm', offset: 282930, size: 19435, timecode: 12.040000 },
    { file: 'video.webm', offset: 302365, size: 7767, timecode: 12.440000 },
    { file: 'video.webm', offset: 310132, size: 14654, timecode: 12.560000 },
    { file: 'video.webm', offset: 324786, size: 12524, timecode: 12.960000 },
    { file: 'video.webm', offset: 337310, size: 7816, timecode: 13.360000 },
    { file: 'video.webm', offset: 345126, size: 11787, timecode: 13.560000 },
    { file: 'video.webm', offset: 356913, size: 12104, timecode: 13.960000 },
    { file: 'video.webm', offset: 369017, size: 7794, timecode: 14.360000 },
    { file: 'video.webm', offset: 376811, size: 8149, timecode: 14.560000 },
    { file: 'video.webm', offset: 384960, size: 4458, timecode: 14.960000 },
    { file: 'video.webm', offset: 389418, size: 1224, timecode: 15.360000 },
    { file: 'video.webm', offset: 390642, size: 1224, timecode: 15.760000 },
    { file: 'video.webm', offset: 391866, size: 17090, timecode: 16.160000 }
  ]


// This variable identifies the segments to be played next.
var segmentQue = new Array (0, 1, 2, 3, 4, 5, 6); // 0 Must be first.

// This is the MSE buffer.
var sourceBuffer;

/*
 *   Functions
 */
function callback(e) {
    console.log('Starting MSE.');
    sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
    console.log('mediaSource codec assigned. (video/webm; codecs="vorbis,vp8")');
    // Sequence source buffer allows objects to be appended in any order.
    // https://developer.mozilla.org/en-US/docs/Web/API/SourceBuffer/mode
    var curMode = sourceBuffer.mode;
    if (curMode == 'segments') {
        sourceBuffer.mode = 'sequence';
        console.log('sourceBuffer.mode set to "sequence"');
    }
    console.log('mediaSource readyState: ' + this.readyState);

    // Set the interval for processing the que. 
    window.setInterval(function() {
        if (segmentQue.length >= 1) {
            processQue_();
        }
    }, rechunkUpdateIntervalMS); // repeat forever, polling every update frequency.
}


function processQue_() {
    // grab the next media segment from the que.
    var mediaItem = fileBinaryIdentifiers[segmentQue[0]];
    console.log('Current segment: ' + mediaItem.file + ' between ' + mediaItem.offset + ' and ' + (mediaItem.offset + mediaItem.size));

    // Start file retrival
    GET(mediaItem.file, false,0,0,function(uInt8Array){
        // The working file blob.
        var file = new Blob([uInt8Array], {
            type: 'video/webm'
        });

        // Now we need to read and append the data from that file.
        var reader = new FileReader();
        // Move variable - debug only.
        var tempMediaItem = mediaItem;
        // Reads aren't guaranteed to finish in the same order they're started in,
        // so we need to read + append the next chunk after the previous reader
        // is done (onload is fired).
        reader.onload = function(e) {
            // Append chunk to the media que.
            // TODO: Add checks to ensure we don't cause errors
            //       in overfilling the buffer.
            sourceBuffer.appendBuffer(new Uint8Array(e.target.result));
            console.log('Appended chunk.');
        };

        // Chunk and Read file
        var chunk = file.slice(tempMediaItem.offset, (tempMediaItem.offset + tempMediaItem.size));
        
        reader.readAsArrayBuffer(chunk);

        //if (video.paused) {
        //    video.play(); // Start playing if buffered enough. TODO: Refine.
        //}
  
        // Trim the front of the que.
        segmentQue.shift();

        // Append a new item to the que, for debugging purposes.
        segmentQue.push(getRandomInt(1, totalValidEntryPoints));
    });
    // End process que function.  
    //console.log('Finished Processing Que.');
}

// Gets a file from disk.
function GET(url,isOpenBlock, rangeMin,rangeMax, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    // The below block may not be required.
    // TODO: Test and remove.
    if(isOpenBlock === true)
    {
        xhr.setRequestHeader("Range", "bytes=" + rangeMin + "-" + rangeMax);
    }    
    xhr.responseType = 'arraybuffer';
    xhr.send();
    // Asynchronus get request.
    xhr.onload = function(e) {
        if (xhr.status != 200) {
            console.log("Error on Fetch, unexpected status code " + xhr.status + " for " + url);
            return false;
        }
        callback(new Uint8Array(xhr.response));
    };
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
// http://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



/*
 *   Events
 */

// We need to add the event that triggers once the media source is ready.
// For the listner to function media source must have been declared and 
// the 'video' player object must have *already* loaded into the page.
mediaSource.addEventListener('sourceopen', callback, false);
mediaSource.addEventListener('webkitsourceopen', callback, false);