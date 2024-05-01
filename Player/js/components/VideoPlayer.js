define(['lib/karaokeLibrary'],function (helper) {
    return class VideoPlayer {
      constructor(props) {
        if (props == null) {
          Object.assign(this, {
            width: 600,
            height: 400,
            showControls: true
          });
        } else if (props instanceof Object) {
          Object.assign(this, props);
        } else {
          throw new Error("props is not an object");
        }

        if (!this.container) {
          throw new Error("Video container is not defined");
        }

        var container = $(this.container);
        var containerID = container.attr('id');
        this.containerID = containerID;
        this.getID = helper.getID.bind(this);

        var video = helper.createDOMObject('<video autoplay>', containerID + "-video", "video");
        video.attr("id", container.attr('id') + "-player")
          .attr("width", this.width)
          .attr("height", this.height);

        if (this.showControls) {
          video.attr('controls', '');
        }

        container.append(video[0]);
      }

      fireEvent(event) {
        $('#'+this.containerID).trigger(event, Array.prototype.slice.call(arguments, 1));
      }

      addListener(event, callback) {
        this.getVideo().on(event, callback);
      }

      removeListeners() {
        if (getEventListeners === undefined) {
          throw new Error("getEventListeners is not defined");
        }
        this.getVideo().off();
      }

      getVideo(returnEl)
      {
        var container = $(this.container);
        if(!returnEl) {
          return container.find('video');
        }
        else {
          return container.find('video')[0];
        }
      }

      play(id) {
        this.getVideo().attr('src',"/api/assets/id/" + id + ".mpg");
        this.getVideo(true).play().then(() => {
          this.fireEvent('TrackStarted', id);
        });
      }

      pause() {
        this.getVideo(true).pause();
      }

      stop() {
        this.getVideo(true).pause();
        this.getVideo(true).currentTime = 0;
      }

      setPlaybackRate(rate) {
        this.getVideo(true).playbackRate = rate;
      }

      getPlaybackRate() {
        this.getVideo(true).playbackRate;
      }

      setVolume(volume) {
        this.getVideo(true).volume = volume;
      }

      getVolume() {
        return this.getVideo(true).volume;
      }

      setDimensions(width, height) {

      }

      restoreDimensions() {

      }
    }
  }
);
