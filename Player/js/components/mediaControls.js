define(['lib/karaokeLibrary'], (helper) => {
  return class MediaControls {
    constructor(props) {
      if (props == null) {
        Object.assign(this, {
          width: 600,
          height: 54,
          handlers: {},
          controlConfig: {
            showNextButton: true,
            showMicrophone: true,
            showVolume: true,
            showFullScreen: true,
            showProgressBar: true,
            showPlayPause: true,
            showPitchControl: true
          }
        });
      } else if (props instanceof Object) {
        Object.assign(this, props);
      } else {
        throw new Error("props is not an object");
      }

      this.container = helper.createDOMObject('<div>',
        "mediaControls-container", "mediaControls-container");
      this.container.width(this.width);

      var containerRow = helper.createDOMObject('<div>');
      containerRow.addClass("mediaControls-container-row");
      this.container.append(containerRow);

      if (this.controlConfig.showPlayPause) {
        var playButton = helper.createDOMObject(
          '<button class="mdiButton mdi-play" title="Pause">', "play-button",
          "playButton");
        playButton.on('click', (event) => {
          this.togglePlay()
        });
        containerRow.append(playButton[0]);
      }
      if (this.controlConfig.showNextButton) {
        containerRow.append(helper.createDOMObject(
          '<button class="mdiButton mdi-skip-next" title="Next Track">',
          "next-button", "nextButton")[0]);
      }
      if (this.controlConfig.showProgressBar) {
        var progressContainer = helper.createDOMObject(
          '<div style="display:inline-grid">');
        progressContainer.append(
          helper.createDOMObject('<progress value="0">', "time-progress-bar",
            "time-progress-bar")[0]);
        progressContainer.append(helper.createDOMObject(
          '<label id="timeLabel" for="time-progress-bar" class="mediaControls-label""></label>'));
        containerRow.append(progressContainer);
        this.initTime(new Date(0));
      }
      if (this.controlConfig.showPitchControl) {
        var pitchContainer = helper.createDOMObject(
          '<div style="display:inline-grid">');
        var pitchRange = helper.createDOMObject(
          '<input type="range" min="-6" max="6" value="0" class="pitch-slider">',
          "pitch-slider", "pitchSlider");
        pitchRange.on('change', (event) => this.setPitch(event.target.value));
        pitchContainer.append(pitchRange[0]);
        pitchContainer.append(
          helper.createDOMObject(
            '<label id="pitchLabel" for=pitch-slider" class="mdiButton mediaControls-label"></label>'));
        containerRow.append(pitchContainer);
        this.setPitch(0);

      }
      if (this.controlConfig.showVolume) {
        var volumeContainer = helper.createDOMObject(
          '<div style="display:inline-flex">');
        var volumeSlider = helper.createDOMObject(
          '<input type="range" min="-10" max="10" value="0" class="volume-slider" >',
          "volume-slider", "volumeSlider");
        volumeSlider.on('change',
          (event) => this.setVolume(event.target.value));
        volumeContainer.append(volumeSlider[0]);
        var muteButton = helper.createDOMObject(
          '<button class="mdiButton mdi-volume-high" title="Mute">',
          'muteButton');
        muteButton.on('click', (event) => this.toggleMuteButton());
        volumeContainer.append(muteButton[0]);
        containerRow.append(volumeContainer);
      }
      if (this.controlConfig.showMicrophone) {
        var microphone = helper.createDOMObject(
          '<button class="mdiButton mdi-microphone" title="Microphone">',
          "microphone", "microphone");
        microphone.on('click', (event) => this.toggleMicrophone());
        containerRow.append(microphone[0]);
      }
      if (this.controlConfig.showFullScreen) {
        var fullScreenButton = helper.createDOMObject(
          '<button class="mdiButton mdi-fullscreen" title="Full Screen">',
          "full-screen", "fullScreen");
        fullScreenButton.on('click', (event) => this.toggleFullScreen());
        containerRow.append(fullScreenButton[0]);
      }
    }

    toggleFullScreen() {
      var fullScreenButton = this.getControl('#full-screen');
      if (fullScreenButton.hasClass('mdi-fullscreen')) {
        fullScreenButton.addClass('mdi-fullscreen-exit').removeClass(
          'mdi-fullscreen');
        fullScreenButton.attr('title', 'Exit Full Screen');
      } else {
        fullScreenButton.addClass('mdi-fullscreen').removeClass(
          'mdi-fullscreen-exit');
        fullScreenButton.attr('title', 'Full Screen');
      }
      this.fireEvent('full_screen_clicked',
        fullScreenButton.hasClass('mdi-fullscreen-exit'));
    }

    toggleMuteButton() {
      var muteButton = this.getControl('#muteButton');
      if (muteButton.hasClass('mdi-volume-high')) {
        muteButton.addClass('mdi-volume-off').removeClass('mdi-volume-high');
        muteButton.attr('title', 'Unmute');
      } else {
        muteButton.addClass('mdi-volume-high').removeClass('mdi-volume-off');
        muteButton.attr('title', 'Mute');
      }

      this.fireEvent('mute_clicked', muteButton.hasClass('mdi-volume-off'));
    }

    fireEvent(strEvent) {
      this.container.trigger(strEvent,
        Array.prototype.slice.call(arguments, 1));
    }

    togglePlay() {
      var playButton = this.getControl('#play-button');
      if (playButton.hasClass('mdi-pause')) {
        playButton.addClass('mdi-play').removeClass('mdi-pause');
        playButton.attr('title', 'Pause');
      } else {
        playButton.addClass('mdi-pause').removeClass('mdi-play');
        playButton.attr('title', 'Play');
      }
      this.fireEvent('play_clicked', playButton.hasClass('mdi-play'));
    }

    toggleMicrophone() {
      var microphone = this.getControl('#microphone');
      if (microphone.hasClass('mdi-microphone')) {
        microphone.addClass('mdi-microphone-off').removeClass('mdi-microphone');
        microphone.attr('title', 'Microphone-on');
      } else {
        microphone.addClass('mdi-microphone').removeClass('mdi-microphone-off');
        microphone.attr('title', 'Microphone-off');
      }
      this.fireEvent('microphone_clicked',
        microphone.hasClass('mdi-microphone'));
    }

    setPitch(pitch) {
      this.getControl('#pitchLabel').html('Pitch step: ' + pitch);
      this.fireEvent('pitch_changed', pitch);
    }

    setVolume(volume) {
      if (volume <= -12) {
        this.getControl('#volume-label').removeClass(
          'mdi-volume-high').addClass('mdi-volume-off');
      } else {
        this.getControl('#volume-label').removeClass('mdi-volume-off').addClass(
          'mdi-volume-high');
      }
      this.fireEvent('volume_changed', volume);
    }

    initTime(length) {
      this.getControl("#time-progress-bar").data('length', length);
      this.setTime(new Date(0));
    }

    setTime(time) {
      var timeProgressBar = this.getControl("#time-progress-bar");
      var length = timeProgressBar.data('length');
      if (length.getMilliseconds() > 0) {
        timeProgressBar[0].value = time.getTime() / length.getTime();
      } else {
        timeProgressBar[0].value = 0;
      }
      this.getControl('#timeLabel').html(
        `${time.getMinutes()}:${time.getSeconds()} / ${length.getMinutes()}:${length.getSeconds()}`);
    }

    getControl(selector) {
      return this.container.find(selector);
    }

    setWidth(width) {
      this.width = width;
      this.container.width(width);
    }

    getWidth(width) {
      return this.width;
    }

    setHeight(height) {
      this.height = height;
      this.container.height(height);
    }

    getHeight(height) {
      return this.height;
    }

  }
});
