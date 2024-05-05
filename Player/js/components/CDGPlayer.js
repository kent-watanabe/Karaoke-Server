define(['lib/CDGraphics','components/mediaControls','lib/karaokeLibrary'],
  function (CDGraphics,MediaControls,helper) {
  return class CDGPlayer {
    constructor(props) {
      if (props == null) {
        Object.assign(this, {
          width: 600,
          height: 540,
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
      this.logo.src = "/images/logo.png";

      var container = $(this.container);
      this.containerID = container.attr('id');
      this.pitchShift = new Tone.PitchShift({
        pitch: 0,
        windowSize: 0.1
      }).toDestination();
      this.player = new Tone.Player();
      this.player.connect(this.pitchShift);

      this.cdGraphics = new CDGraphics();
      var canvas = $('<canvas id="canvas">');
      canvas.attr('width',this.width);
      canvas.attr('height',this.height-54);
      this.mediaControls = new MediaControls({
        width: this.width,
        height: 54,
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
      container.append(canvas[0]);
      container.append(this.mediaControls.container);

      this.mediaControls.getControl('#next-button').on('click', (event) => {
        Tone.Transport.stop();
        this.mediaControls.initTime();
        this.fireEvent('nextTrack');
      });
      this.mediaControls.container.on('pitch_changed', (e, pitch)=>this.pitchShift.pitch = pitch);
      this.mediaControls.container.on('volume_changed', (e, volume)=>{this.player.volume.value = volume;});
      this.mediaControls.container.on('play_clicked', (event, state)=>this.handlePlayPause(state));
      this.mediaControls.container.on('mute_clicked', (event, state)=>this.handleMute(state));
      container.on('full_screen_clicked', (event, state) => this.handleFullScreen(state));
      container.on('fullscreenchange', (e) => this.handleFullScreenChange(e));
      container.on('dblclick', (e) => this.handleDoubleClick(e));

      this.frameId = 0;
      this.mediaControls.setVolume(Tone.Destination.volume.value);

      Tone.Transport.on('start',this.transportPlayHandler.bind(this));
      Tone.Transport.on('pause',this.transportPauseHandler.bind(this));

      this.ctx = canvas[0].getContext('2d');
      this.clearCanvas();
    }

    handleFullScreenChange(event) {
      if (!document.fullscreenElement) {
        this.exitedFullScreen();
      }
    }

    handleDoubleClick(event) {
      this.handleFullScreen(!!document.fullscreenElement)
    }

    handleFullScreen(state) {
      if(!state) {
        $('#'+this.containerID)[0].requestFullscreen().then(() => {
          this.setDimensions(window.outerWidth, window.outerHeight);
        });
      }
      else
      {
        document.exitFullscreen().then(()=>this.exitedFullScreen());
      }
    }

    exitedFullScreen() {
      this.setDimensions(this.width, this.height);
    }

    handleMute(state)
    {
      if(state) {
        Tone.Destination.mute = true;
      }
      else {
        Tone.Destination.mute = false;
      }
    }

    handlePlayPause(state)
    {
      if(state) {
        Tone.Transport.start();
      }
      else {
        Tone.Transport.pause();
      }
    }

    fireEvent(event) {
      $('#'+this.containerID).trigger(event, Array.prototype.slice.call(arguments, 1));
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

    transportPlayHandler() {
      if(Tone.Transport.seconds > this.player.buffer.duration) {
        this.fireEvent('TrackEnded');
        return;
      }
      this.frameId = requestAnimationFrame(this.transportPlayHandler.bind(this));
      this.mediaControls.setTime(new Date(Tone.Transport.seconds*1000));
      this.renderHandler(Tone.Transport.seconds);
    }

    transportPauseHandler() {
      cancelAnimationFrame(this.frameId);
    }

    play(id) {
      fetch("/api/assets/id/" + id + ".cdg")
      .then(response => response.arrayBuffer())
      .then(buffer => {
        this.cdGraphics.load(buffer);
        this.player.load("/api/assets/id/" + id + ".mp3",).then(()=>{
          this.mediaControls.initTime(new Date(this.player.buffer.duration*1000));
          this.player.sync().start();
          this.fireEvent('TrackStarted',id);
          Tone.Transport.start();
        });
      });
    }

    stop() {
      this.clearCanvas();
    }

    setVolume(volume) {
      this.player.volume.value = volume;
    }

    getVolume() {
      return this.player.volume.value;
    }

    setDimensions(width, height) {
      var canvas = $('#canvas');
      canvas.attr('width', width);
      this.mediaControls.setWidth(width);
      canvas.attr('height', height-this.mediaControls.getHeight());
    }

    restoreDimensions() {
      var container = $("#" + this.containerID);
      var canvas = container.find('#canvas');
      canvas.attr('width', this.width);
      this.mediaControls.setWidth(this.width);
      canvas.attr('height', this.height-this.mediaControls.getHeight());
    }
  }
});
