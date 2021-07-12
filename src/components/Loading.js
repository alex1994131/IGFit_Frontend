import React from "react";
class SpinnerComponent extends React.Component {
  render() {
    return (
      <div
        className=""
        style={{ display: "none", width: "0px", height: "0px" }}
      ></div>
    );
  }
}

export default SpinnerComponent;
