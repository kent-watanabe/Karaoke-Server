define(['CDGraphics','./mediaControls.js'], function (CDGraphics,MediaControls) {
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
      this.pitchShift = new Tone.PitchShift({
        pitch: 0,
      }).toDestination();
      this.player = new Tone.Player();
      this.player.connect(this.pitchShift);

      this.cdGraphics = new CDGraphics();
      var canvasTag = "<canvas width='"+ this.width +"' height='"+ this.height +"'>";
      var canvas = $(canvasTag);
      this.mediaControls = new MediaControls();
      container.append(canvas[0]);
      container.append(this.mediaControls.container);
      this.mediaControls.getControl('#next-button').on('click', this.nextTrackFn.bind(this));
      this.mediaControls.container.on('pitch_changed', (e, pitch)=>this.pitchShift.pitch = pitch);
      this.mediaControls.container.on('volume_changed', (e, volume)=>{
        this.player.volume.value = volume;
      });
      this.mediaControls.container.on('play_clicked', (event, state)=>this.handlePlayPause(state));

      this.frameId = 0;
      this.mediaControls.setVolume(Tone.Destination.volume.value);

      Tone.Transport.on('start',this.transportPlayHandler.bind(this));
      Tone.Transport.on('pause',this.transportPauseHandler.bind(this));


      this.setDimensions(this.width, this.height);
      this.ctx = canvas[0].getContext('2d');
      this.clearCanvas();
    }

    handlePlayPause(state)
    {
      if(state === 'paused') {
        Tone.Transport.start();
      }
      else {
        Tone.Transport.pause();
      }
    }

    fireEvent(event) {
      $('#'+this.containerID).trigger(event, Array.prototype.slice.call(arguments, 1));
    }

    nextTrackFn() {
      Tone.Transport.stop();
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
        this.nextTrackFn();
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
      var container = $(this.container);
      var canvas = container.find(this.getJquerySelector('canvas'));
      canvas.attr('width', width);
      canvas.attr('height', height-this.mediaControls.container.height());
    }

    restoreDimensions() {
      var container = $(this.container);
      var canvas = container.find(this.getJquerySelector('canvas'));
      canvas.attr('width', this.width);
      canvas.attr('height', this.height-this.mediaControls.container.height());
    }
  }
});
