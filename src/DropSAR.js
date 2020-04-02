import React, {Component} from 'react';

import BlowfishContext from './blowfish';
import * as prs from './prs';
import * as struct from './struct';
import sarSchema from './sarstruct';

const SARPrint = ({parsed, buffer}) => (
  <div>
    <p>Here's the parsed object</p>
    <pre>
      {JSON.stringify(parsed, null, 2)}
    </pre>
  </div>
);

export class DropSAR extends Component {
  constructor(props) {
    super(props);
    this.handleDrop = this.handleDrop.bind(this);
    this.state = {
      file: null,
      buffer: null,
      error: false,
    };
  }

  handleDrop(ev) {
    let file = ev.target.files[0];
    if (file) {
      let fr = new FileReader();
      fr.onloadend = (evv) => {
        let buffer = evv.target.result;
        let u8view = new Uint8Array(buffer);
        let flag = u8view[3];

        // check the format is correct
        if (u8view[0] !== 115 || u8view[1] !== 97 || u8view[2] !== 114) {
          this.setState({
            error: 'not a SAR file',
          });
          return;
        }
        if (flag !== 0x84 && flag !== 0x04) {
          this.setState({
            error: `invalid flag (${flag})`,
          });
          return;
        }

        u8view = u8view.slice(4, buffer.byteLength);
        let keyBuffer = Uint8Array.of(0x09, 0x07, 0xc1, 0x2b).buffer;
        let ctx = new BlowfishContext(keyBuffer);
        try {
          ctx.decrypt(u8view.buffer);
          let resultBuffer = u8view.buffer;
          if (flag === 0x84) {
            u8view = u8view.map(v => v ^ 0x95);
            resultBuffer = prs.decompress(u8view.buffer);
          }

          let parsed = struct.parse(resultBuffer, sarSchema);

          this.setState({
            file,
            buffer: resultBuffer,
            parsed: parsed,
            error: false,
          });
          console.log(parsed);
          if (this.props.onUpdateSar) {
            this.props.onUpdateSar(parsed);
          }
        } catch (e) {
          this.setState({
            error: e.toString(),
          });
        }
      };
      fr.readAsArrayBuffer(file);
    } else {
      this.setState({
        file: null,
        buffer: null,
        error: false,
      });
      if (this.props.onUpdateSar) {
        this.props.onUpdateSar(null);
      }
    }
  }

  render() {
    // <SARPrint buffer={this.state.buffer} parsed={this.state.parsed}/>
    return (
      <div>
        <p>drop a sar file here</p>
        <input type="file" name="sarfile" accept=".sar" onChange={this.handleDrop} />
        <p>File name: <code>{this.state.file ? this.state.file.name : 'pick a file'}</code></p>

        {this.state.error ?
          <p>Error decoding! {this.state.error}</p>
        : null}
      </div>
    );
  }
}
