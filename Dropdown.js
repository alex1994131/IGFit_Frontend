import React from 'react';
import { Checkbox, FormControl, FormControlLabel, makeStyles, MenuItem, Select, Typography } from '@material-ui/core';
import { Favorite, FavoriteBorder } from '@material-ui/icons';
import { useState } from 'react';

const useStyles = makeStyles({
    label: {
      fontSize: 'inherit',
    },
  });

export const Dropdown = props => {
    let { value, row, updateValue, update, dropdown_list, component = 'select', label } = props;
    // const [checked, setChecked] = useState(0);

    const classes = useStyles();

    const onChange = async (new_val) => {
        if (await update(new_val,row)) {
            updateValue(new_val);
            console.log("updated");
        }
    };

    const select_component = <Select
            value={value != null && (typeof value == 'string' ? value : value.toString())}
            onChange={async e => {
                onChange(e.target.value)
            }
            }
            style={{ fontSize: 'inherit' }}>

            {dropdown_list.map((category, index) =>
                <MenuItem key={index} value={category}>
                    {typeof category == 'string' ? category : category.toString()}
                </MenuItem>
            )}

        </Select>

    const checkbox_component = <FormControlLabel
        control={<Checkbox
            icon={<FavoriteBorder />}
            checkedIcon={<Favorite />}
            name="checked"
            checked={value}
            onChange={async e => {
                console.log(e);
                onChange(e.target.checked);
            }} />
        }
        label={label}
        classes={{label:classes.label}}
        //style={{ fontSize: 'inherit' }}
    />

    return (
        <FormControl>
            {component == 'select' ? select_component : checkbox_component}
        </FormControl>
    );
};
