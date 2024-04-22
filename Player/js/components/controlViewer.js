define(['lib/karaokeLibrary', 'components/mediaControls'],
  function (helper, MediaControls) {
    $(document).ready(function () {
      var mediaControls = new MediaControls();
      $(document.body).append(mediaControls.container);
      mediaControls.getControl('#play-button').on('click', function () {
        console.log('play clicked');
      });
      mediaControls.getControl('#next-button').on('click', function () {
        console.log('next clicked');
      });
      mediaControls.getControl('#pitch-slider').on('change', function (e) {
        console.log('pitch changed to ' + e.target.value);
      });
      mediaControls.getControl('#volume-slider').on('change', function (e) {
        console.log('volume changed to ' + e.target.value);
      });
    });
  });
