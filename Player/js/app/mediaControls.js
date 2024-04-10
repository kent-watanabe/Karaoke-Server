define(['karaokeLibrary'], (helper) => {
  return class MediaControls {
    constructor(props) {
      if (props == null) {
        Object.assign(this, {
          width: 600,
          height: 54,
          handlers: {},
          containerID: "mediaControls",
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
          '<button class="mdiButton mdi-play" title="Play">', "play-button",
          "playButton");
        playButton.on('click', (event) => {this.togglePlay()});
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
        volumeContainer.append(helper.createDOMObject(
          '<label for="volume-slider" class="mdiButton mdi-volume-high">',
          'volume-label')[0]);
        containerRow.append(volumeContainer);
      }
      if (this.controlConfig.showMicrophone) {
        var microphone = helper.createDOMObject(
          '<button class="mdiButton mdi-microphone" title="Microphone">',
          "microphone", "microphone");
        microphone.on('click', (event) => this.toggleMicrophone());
        microphone.data('state', 'on');
        containerRow.append(microphone[0]);
      }
      if (this.controlConfig.showFullScreen) {
        containerRow.append(helper.createDOMObject(
          '<button class="mdiButton mdi-fullscreen" title="Full Screen">',
          "full-screen", "fullScreen")[0]);
      }
    }

    fireEvent(strEvent) {
      this.container.trigger(strEvent, Array.prototype.slice.call(arguments, 1));
    }

    togglePlay() {
      var playButton = this.getControl('#play-button');
      if (playButton.hasClass('mdi-pause')) {
        playButton.addClass('mdi-play').removeClass('mdi-pause');
        playButton.data('state', 'paused');
      } else {
        playButton.addClass('mdi-pause').removeClass('mdi-play');
        playButton.data('state', 'play');
      }
      this.fireEvent('play_clicked', playButton.data('state'));
    }

    toggleMicrophone() {
      var microphone = this.getControl('#microphone');
      if (microphone.hasClass('mdi-microphone')) {
        microphone.addClass('mdi-microphone-off').removeClass('mdi-microphone');
        microphone.data('state', 'off');
      } else {
        microphone.addClass('mdi-microphone').removeClass('mdi-microphone-off');
        microphone.data('state', 'on');
      }
      this.fireEvent('microphone_clicked', microphone.data('state'));
    }

    setPitch(pitch) {
      this.getControl('#pitchLabel').html('Pitch step: '+ pitch);
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
      if(length.getMilliseconds() > 0) {
        timeProgressBar[0].value = time.getTime() / length.getTime();
      }
      else
      {
        timeProgressBar[0].value = 0;
      }
      this.getControl('#timeLabel').html(
        `${time.getMinutes()}:${time.getSeconds()} / ${length.getMinutes()}:${length.getSeconds()}`);
    }

    getControl(selector) {
      return this.container.find(selector);
    }
  }
});
