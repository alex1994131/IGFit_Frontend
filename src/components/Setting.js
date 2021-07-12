import React, { useState, useEffect, useContext } from "react";
import { useStyles } from "react-styles-hook";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import {
  Container,
  Button,
  Dropdown,
  Divider,
  Icon,
  Confirm,
} from "semantic-ui-react";
import "semantic-ui-less/semantic.less";

import { UserContext } from "../stores/contexts/UserContext";
import { updateBaseCurrency } from "../stores/actions/userAction";

const styles = useStyles({
  fluidInput: {
    width: "100%",
    marginBottom: "10px",
  },
});

const Setting = (props) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const accessToken = useSelector((state) => state.auth.authorizationToken);

  const current_user = useContext(UserContext);

  const base_currency = [
    {
      key: 1,
      text: "USD",
      value: "USD",
    },
    {
      key: 2,
      text: "GBP",
      value: "GBP",
    },
    {
      key: 3,
      text: "EUR",
      value: "EUR",
    },
    {
      key: 4,
      text: "JPY",
      value: "JPY",
    },
    {
      key: 5,
      text: "HKD",
      value: "HKD",
    },
    {
      key: 6,
      text: "RMB",
      value: "RMB",
    },
    {
      key: 7,
      text: "CAD",
      value: "CAD",
    },
  ];

  const [currency, setCurrency] = useState("");
  const [confirmation, setConfirmation] = useState(false);

  const onBaseCurrencyChange = async (e, data) => {
    setCurrency(data.value);
  };

  const onSaveCurrency = async () => {
    setConfirmation(true);
  };

  const onCancel = () => {
    setConfirmation(false);
  };

  const onConfirm = async () => {
    const result = await updateBaseCurrency(accessToken, currency);
    if (result.status) {
      setCurrency(result.data.currency);
      current_user.updateUserDetails({
        username: result.data.username,
        email: result.data.email,
        currency: result.data.currency,
        portfolio: result.data.portfolio,
      });
      setConfirmation(false);
    } else {
      alert(result.data);
    }
  };

  useEffect(() => {
    if (props.currency) {
      setCurrency(props.currency);
    }
  }, [props]);

  return (
    <>
      <Confirm
        open={confirmation}
        content="Base currency update will be effective when you next login. Log out now?"
        cancelButton="NO"
        confirmButton="YES"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
      <Container fluid>
        <label>Base Currency</label>
        <Dropdown
          placeholder="Base Currency"
          onChange={onBaseCurrencyChange}
          style={{ width: "100%", marginBottom: "10px" }}
          value={currency}
          fluid
          selection
          options={base_currency}
        />
        <Divider />
        <Button color="red" onClick={(e) => onSaveCurrency(e)}>
          <Icon name="save" /> Save
        </Button>
      </Container>
    </>
  );
};

export default Setting;
