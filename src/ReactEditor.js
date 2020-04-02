// React binding to the agnostic editor

import React from 'react';
import PropTypes from 'prop-types';
import Regl from 'regl';
import {mat4, quat} from 'gl-matrix';


const commonVert = `
precision mediump float;

attribute vec3 position;

uniform mat4 modelViewProjection;

void main() {
  gl_Position = modelViewProjection * vec4(position, 1);
}
`;

const coloredFrag = `
precision mediump float;

uniform vec4 color;

void main() {
  gl_FragColor = color;
}
`;

export default class ReactEditor extends React.Component {
  static propTypes = {
    layers: PropTypes.arrayOf(PropTypes.object),
  };

  static defaultProps = {
    layers: [],
  };

  constructor(props) {
    super(props);
    this.redraw = this.redraw.bind(this);
    this.changeElement = this.changeElement.bind(this);
  }

  componentWillUnmount() {
    this.reglTick.cancel();
    this.regl.destroy();
  }

  changeElement(el) {
    if (this.regl) {
      this.reglTick.cancel();
      this.regl.destroy();
    }
    this.el = el;
    this.regl = Regl(this.el, {
      attributes: {
        antialias: false,
        preferLowPowerToHighPerformance: true,
      },
    });
    this.reglTick = this.regl.frame(this.redraw);
    this.buildCommands();
  }

  render() {
    return <div ref={this.changeElement} style={{height: 480}}/>;
  }

  buildCommands() {
    let regl = this.regl;

    this.cmdSetupCamera = regl({
      context: {
        projection: function (ctx) {
          let aspect = ctx.viewportWidth / ctx.viewportHeight;
          return mat4.ortho([], -0.5 * aspect, 0.5 * aspect, -0.5, 0.5, 0, 1);
        },
        view: mat4.identity([]),
        model: mat4.identity([]),
      },

      uniforms: {
        projection: regl.context('projection'),
        view: regl.context('view'),
        model: regl.context('model'),
        viewProjection: function (ctx) {
          return mat4.multiply([], ctx.view, ctx.projection);
        },
        modelViewProjection: function (ctx) {
          return mat4.multiply([], mat4.multiply([], ctx.model, ctx.view), ctx.projection);
        },
      },

      vert: commonVert,
    });

    this.cmdApplyView = regl({
      context: {
        view: function (ctx, props) {
          let view = ctx.view || mat4.identity([]);
          let newView = mat4.fromRotationTranslationScale(
            [],
            props.rotation || quat.identity([]),
            props.translation || [0, 0, 0],
            props.scale || [1, 1, 1],
          );
          view = mat4.multiply([], mat4.invert([], newView), view);
          return view;
        },
      },

      uniforms: {
        view: regl.context('view'),
        viewProjection: function (ctx) {
          return mat4.multiply([], ctx.view, ctx.projection);
        },
        modelViewProjection: function (ctx) {
          return mat4.multiply([], mat4.multiply([], ctx.model, ctx.view), ctx.projection);
        },
      },
    });

    this.cmdApplyModel = regl({
      context: {
        model: function (ctx, props) {
          let model = ctx.model || mat4.identity([]);
          let newModel = mat4.fromRotationTranslationScale(
            [],
            props.rotation || quat.identity([]),
            props.translation || [0, 0, 0],
            props.scale || [1, 1, 1],
          );
          model = mat4.multiply([], newModel, model);
          return model;
        },
      },
      
      uniforms: {
        model: regl.context('model'),
        modelViewProjection: function (ctx) {
          return mat4.multiply([], mat4.multiply([], ctx.model, ctx.view), ctx.projection);
        },
      },
    });

    this.cmdDrawColoredTriangleStrip = regl({
      attributes: {
        position: regl.prop('positions'),
      },
      primitive: 'triangle strip',
      uniforms: {
        color: regl.prop('color'),
      },
      frag: coloredFrag,
      count: function (ctx, props) { return props.positions.length; },
      blend: {
        enable: true,
        func: {
          srcRGB: 'src alpha',
          srcAlpha: 1,
          dstRGB: 'one minus src alpha',
          dstAlpha: 1,
        },
        equation: {
          rgb: 'add',
          alpha: 'add',
        },
        color: [0, 0, 0, 0],
      },
    });
  }

  redraw(context) {
    this.regl.clear({
      color: [0, 0, 0, 0],
      depth: 1,
    });

    if (typeof this.props.sizeWidth !== 'number' || typeof this.props.sizeHeight !== 'number') {
      return;
    }

    this.cmdSetupCamera((ctx) => {
      this.cmdApplyView({translation: [this.props.sizeWidth, this.props.sizeHeight * 2, 0], scale: [this.props.sizeWidth, -this.props.sizeHeight, 1]}, () => {
        for (let layer of this.props.layers) {
          let {points, props} = layer;
          this.cmdDrawColoredTriangleStrip({
            color: [props.colorR / 63, props.colorG / 63, props.colorB / 63, props.transparency / 7],
            positions: [
              [points.bottomLeft.x, points.bottomLeft.y, 0],
              [points.bottomRight.x, points.bottomRight.y, 0],
              [points.topLeft.x, points.topLeft.y, 0],
              [points.topRight.x, points.topRight.y, 0],
            ],
          });
        }
      });
    });
  }
}
