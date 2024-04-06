define(['CDGraphics'], function (CDGraphics) {
  return class CDGPlayer {
    constructor(props) {
      if (props == null) {
        Object.assign(this, {
          width: 600,
          height: 432,
          showControls: true
        });
      } else if (props instanceof Object) {
        Object.assign(this, props);
      } else {
        throw new Error("props is not an object");
      }

      if (!this.container) {
        throw new Error("CDG container is not defined");
      }

      this.logo = new Image();
      this.logo.src = "/img/logo.png";

      var container = $(this.container);
      var containerID = container.attr('id');
      this.containerID = containerID;
      this.getID = helper.getID.bind(this);
      this.getJquerySelector = helper.getJquerySelector.bind(this);

      this.cdGraphics = new CDGraphics();
      var canvasTag = "<canvas width='"+ this.width +"' height='"+ this.height +"'>";
      var canvas = helper.createDOMObject(canvasTag, containerID + "-canvas", "cdgCanvas");
      var audio = helper.createDOMObject('<audio audioplay>', containerID + "-audio", "cdgAudio");
      var audioContainer = helper.createDOMObject('<div>', containerID + "-audio-container", "audioContainer");
      let controlsWrapper = helper.createDOMObject('<div>', containerID + "-controls-wrapper", "controlsWrapper");
      audioContainer.append(controlsWrapper[0]);
      let audioWrapper = helper.createDOMObject('<div>', containerID + "-audio-wrapper", "audioWrapper");
      audioWrapper.append(audio);
      controlsWrapper.append(audioWrapper[0]);
      let buttonWrapper = helper.createDOMObject('<div>', containerID + "-button-wrapper", "buttonWrapper");
      controlsWrapper.append(buttonWrapper[0]);
      var nextButton = helper.createDOMObject('<button class="mdiButton mdi-skip-next" title="Next Track">', containerID + "-next-button", "nextButton");
      var octaveUp = helper.createDOMObject('<button class="mdiButton mdi-music-note-plus" title="Octave Up">', containerID + "-octave-up", "octaveUp");
      var octaveDown = helper.createDOMObject('<button class="mdiButton mdi-music-note-minus" title="Octave Down">', containerID + "-octave-down", "octaveDown");
      var microphone = helper.createDOMObject('<button class="mdiButton mdi-microphone" title="Microphone">', containerID + "-microphone", "microphone");
      buttonWrapper.append(nextButton[0]);
      buttonWrapper.append(octaveUp[0]);
      buttonWrapper.append(octaveDown[0]);
      buttonWrapper.append(microphone[0]);

      nextButton.on('click', this.nextTrackFn.bind(this));
      microphone.on('click', (event)=>this.fireEvent('microphone_clicked'));
      octaveUp.on('click', (event)=>this.fireEvent('octaveUp'));
      octaveDown.on('click', (event)=>this.fireEvent('octaveDown'));

      if (this.showControls) {
        audio.attr('controls', '');
      }

      container.append(canvas[0]);
      container.append(audioContainer[0]);
      this.frameId = 0;

      // follow audio events (depending on your app, not all are strictly necessary)
      audio.on('play', this.playHandler.bind(this));
      audio.on('pause', this.pauseHandler.bind(this));
      audio.on('ended', this.nextTrackFn.bind(this));
      audio.on('seeked', this.renderHandler(audio[0].currentTime));

      this.setDimensions(this.width, this.height);
      this.ctx = canvas[0].getContext('2d');
      this.clearCanvas();
    }

    setOctaveIncrement(inc) {
      this.getAudio(true).playbackRate = this.getAudio(true).playbackRate * inc;
    }

    setMicrophoneStatus(status) {
      var microphoneBtn = $(this.container).find(this.getJquerySelector('microphone'));
      if(!status)
      {
        microphoneBtn.addClass('mdi-microphone-off');
        microphoneBtn.removeClass('mdi-microphone');
      }
      else
      {
        microphoneBtn.addClass('mdi-microphone');
        microphoneBtn.removeClass('mdi-microphone-off');
      }
    }

    fireEvent(event) {
      $('#'+this.containerID).trigger(event, Array.prototype.slice.call(arguments, 1));
    }

    nextTrackFn() {
      this.fireEvent('nextTrack');
    }

    getCanvas(returnEl) {
      var container = $(this.container);
      if(!returnEl) {
        return container.find('canvas');
      }
      else {
        return container.find('canvas')[0];
      }
    }

    getAudio(returnEl) {
      var container = $(this.container);
      if(!returnEl) {
        return container.find('audio');
      }
      else {
        return container.find('audio')[0];
      }
    }

    renderHandler(time) {
      var frame
      try {
        frame = this.cdGraphics.render(time, {});
      } catch (e) {
        return;
      }
      if (!frame.isChanged) {
        return;
      }

      createImageBitmap(frame.imageData).then(this.drawBitmapOnCanvas.bind(this));
    }

    drawBitmapOnCanvas(bitmap) {
      var canvas = this.getCanvas(true);
      this.ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.drawImage(bitmap, 0, 0, canvas.clientWidth,canvas.clientHeight);
    }

    clearCanvas() {
      var canvas = this.getCanvas(true);
      this.ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      this.ctx.drawImage(this.logo, 0, 0, canvas.clientWidth,canvas.clientHeight);
    }

    playHandler() {
      this.frameId = requestAnimationFrame(this.playHandler.bind(this));
      this.renderHandler(this.getAudio(true).currentTime);
    }

    pauseHandler() {
      cancelAnimationFrame(this.frameId);
    }

    isReadyToPlay(resolve, reject){
      const i=0;
      var audio = this.getAudio(true);
      if(audio.readyState != 4) {
        setTimeout(function() {
          this.isReadyToPlay(resolve, reject);
        }.bind(this),100);
      }
      else
      {
        resolve();
      }
    }

    play(id) {
      fetch("/api/assets/id/" + id + ".cdg")
      .then(response => response.arrayBuffer())
      .then(buffer => {
        this.cdGraphics.load(buffer);
        this.getAudio(true).src = "/api/assets/id/" + id + ".mp3";
        this.getAudio(true).play();
      });
    }



    pause() {
      this.getAudio(true).pause();
    }

    stop() {
      var audio = this.getAudio(true);
      audio.pause();
      audio.currentTime = 0;
      this.clearCanvas();
    }

    setPlaybackRate(rate) {
      this.getAudio(true).playbackRate = rate;
    }

    getPlaybackRate() {
      return this.getAudio(true).playbackRate;
    }

    setVolume(volume) {
      this.getAudio(true).volume = volume;
    }

    getVolume() {
      return this.getAudio(true).volume;
    }

    setDimensions(width, height) {
      var container = $(this.container);
      var canvas = container.find(this.getJquerySelector('canvas'));
      var buttonWrapper = container.find(this.getJquerySelector('button-wrapper'));
      var audio = this.getAudio();
      audio.width(width-buttonWrapper.width());
      canvas.attr('width', width);
      canvas.attr('height', height-audio.height());
    }

    restoreDimensions() {
      var container = $(this.container);
      var canvas = container.find(this.getJquerySelector('canvas'));
      var buttonWrapper = container.find(this.getJquerySelector('button-wrapper'));
      var audio = this.getAudio();
      audio.width(this.width-buttonWrapper.width());
      canvas.attr('width', this.width);
      canvas.attr('height', this.height-audio.height());
    }
  }
});
