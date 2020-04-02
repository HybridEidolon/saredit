import React from 'react';
import { hot } from 'react-hot-loader/root';

import {DropSAR} from './DropSAR';
import ReactEditor from './ReactEditor';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sar: {},
    };
    this.setSar = this.setSar.bind(this);
  }

  setSar(sar) {
    this.setState({sar});
  }

  render() {
    return (
      <div>
        <h1>Symbol Art Editor</h1>
        <DropSAR onUpdateSar={this.setSar} />
        <ReactEditor
          layers={this.state.sar.layers || []}
          sizeWidth={this.state.sar.sizeWidth || 1}
          sizeHeight={this.state.sar.sizeHeight || 1}
        />
      </div>
    );
  }
}

export default hot(App);
