# InterACT - In browser WebM video concatenation
 On-the-fly video concatenation using Javascript and Media source extensions for correctly formatted WebM files.



## Basic Setup
To use this code you need:
1. A [compatible](http://caniuse.com/#feat=mediasource) Web Browser.

2. A Web Server (A simple python webserver is available /Code/SimpleHttpServer.py).

3. A HTML page with a video tag.

````HTML
<video controls autoplay width="640" height="480"></video>
````

4. A **compatible** WebM video file.

4.i. Obtain a video file, `.mp4`, `.WebM`, or some other format that plays nice with ffmpeg.

4.ii. Obtain `ffmpeg`, some users will need to compile or [download](https://ffmpeg.org/download.html) ffmpeg. [Media-autobuild_suite](https://github.com/jb-alvarado/media-autobuild_suite) is a good tool for Windows users, the light build will work (libvpx).

4.iii. Obtain `sample_muxer` by building `libwebm` found [here](https://github.com/webmproject/libwebm).

4.iv. Obtain `mse-tools` and build `mse_json_manifest`, tools and guide avaliable [here](https://github.com/acolwell/mse-tools).

4.v. Run `ffmpeg -i yourfile.ext -g 10 -c:v libvpx result.webm`.

4.vi. Run `sample_muxer -i result.webm -o resultRepaired.webm`.

4.vii. Run `mse_json_manifest resultRepaired.webm` to get the alignment information passed to stdout. Additionally you could run `mse_json_manifest resultRepaired.webm > out.json` on Windows to save the information to file.

4.viii. Reformat the alignment information from:

 ````json
{
  "type": "video/webm; codecs=\"vp8, vorbis\"",
  "duration": 17595.000000,
  "init": { "offset": 0, "size": 4249},
  "media": [
    { "offset": 4249, "size": 11757, "timecode": 0.000000 },
    { "offset": 16006, "size": 9128, "timecode": 0.039000 },
    { "offset": 25134, "size": 9303, "timecode": 0.063000 },
    { "offset": 34437, "size": 8958, "timecode": 0.109000 },
    { "offset": 43395, "size": 9259, "timecode": 0.155000 },
    { "offset": 52654, "size": 10202, "timecode": 0.202000 },
// ...40 Entries later...
  ]
}
 ````
 to include information about the video file location and remove the `""` quotation marks. Eg:
 ````Javascript
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
// ...40 Entries later...
]
 ````
For direct insertion into the code this data must be assigned to a variable.

5. Run the python script, ensuring that you have included the `InterACT.js` **below** the video component in `index.html`.


Your compatible browser should now display randomly selected segments of your chosen videos infinitely appending them until there is no more buffer space available. Many thanks to [this](http://stackoverflow.com/questions/37786956/media-source-extensions-appendbuffer-of-webm-stream-in-random-order) post by [lukyer](http://stackoverflow.com/users/1977799/lukyer) that pointed me in the right direction. 



## Explanation
1. The Media Source Extensions (MSE) provide an easy way to allow video to be dynamically sourced by the browser as opposed to the traditional file hotlinking, for further reading [this post](https://hacks.mozilla.org/2015/07/streaming-media-on-demand-with-media-source-extensions/) is a good starting point.
2. A web server is required because a web browser will not usually allow the loading of MSE resources from a local file system.
3. `ffmpeg` is one of the best video converting tools avaliable, however it usually requires building which can be an ordeal for a beginner.
4. `sample_muxer` is required because `ffmpeg` struggles to align the video 'chunks' correctly. Specifically the sample_muxer will order the cues in line with the key frame assigned by ffmpeg (`10` in the example).
5. `mse_json_manifest` will output the binary offset of these cues so the Javascript can be instructed to load valid segments of the video file.


## Points of interest
For this technique to work the MSE **must always** add the metadata from the video first, this can be seen in the output from the `mse_json_manifest` tool in the line:
````json
init: { "offset": 0, "size": 4249},
````
This line must become the first segment loaded:
````Javascript
{ file: 'video.webm', offset: 0, size: 326, timecode: 0.000000 },
````

A further issue is that if the buffer is continuely appended to, it will reach a point where it is 'full'; all future attempts to append to the buffer will then fail until some video is played and discared by the browser.



## How does it work?
Simply:
````Javascript
var ms = new MediaSource();

var video = document.querySelector('video');
video.src = window.URL.createObjectURL(ms);

ms.addEventListener('sourceopen', function(e) {
  ...
  var sourceBuffer = ms.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
  sourceBuffer.appendBuffer(oneVideoWebMChunk);
  ....
}, false);
````
The code replaces the standard video url with a blob, that for chrome users can be found at [chrome://media-internals/](chrome://media-internals/). Next the code creates and assigns a buffer to the video object that can be filled at a later time. Finally, by calling `someBuffer.appendBuffer(binaryVideoChunk);` new content is added to the blob ready for playback. 
Copied from the excellent Media Source API Demo that can be found [here](http://html5-demos.appspot.com/static/media-source.html).



## Further Information
* [Wikipedia](https://en.wikipedia.org/wiki/Media_Source_Extensions)
* [W3C Media Source Extensions Candidate](https://www.w3.org/TR/media-source/)
* [StackOverflow 'media-source](http://stackoverflow.com/questions/tagged/media-source)


Happy Hunting!