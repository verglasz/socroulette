import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import CheckboxGroup from './checkboxgroup';
import RangeSlider from './range';
import {
  nullObj,
  useRange,
  useTristate,
  returnSelected,
  returnExcluded,
  Pair,
  FilterData,
  ObjSetterCallback,
  NestedObjSetterCallback,
} from './utils';

type SectionProps = {
  setFilters: any;
  data: FilterData;
  name: string;
};

type SectionState = {
  ranges: Record<string, Pair<number>>;
  binaryProps: Record<string, Record<string, number>>;
};

function updateFilters(old, sectionName: string, sectionState: SectionState) {
  const updated = { ...old };
  Object.entries(sectionState.ranges).forEach(([name, range]) => {
    updated[name] = range;
  });
  Object.entries(sectionState.binaryProps).forEach(([name, values]) => {
    updated.excluded[name] = returnExcluded(values);
    updated.selected[name] = returnSelected(values);
  });
  return updated;
}

function useSection(
  data: FilterData
): [SectionState, ObjSetterCallback<Pair<number>>, NestedObjSetterCallback<number>] {
  const stateGen: () => SectionState = () => {
    const propentries = Object.entries(data.binaryProps).map(([property, values]) => [
      property,
      nullObj(values),
    ]);
    return { ranges: data.ranges, binaryProps: Object.fromEntries(propentries) };
  };
  const [sectionState, setState] = useState(stateGen);
  const setRange = useCallback(
    (name, value) =>
      setState((state) => ({
        binaryProps: state.binaryProps,
        ranges: { ...state.ranges, [name]: value },
      })),
    [setState]
  );
  const setBinprop = useCallback(
    (prop, name, value) =>
      setState((state) => ({
        ranges: state.ranges,
        binaryProps: {
          ...state.binaryProps,
          [prop]: { ...state.binaryProps[prop], [name]: value },
        },
      })),
    [setState]
  );
  return [sectionState, setRange, setBinprop];
}

export default function FilterSection({ setFilters, data, name }: SectionProps) {
  const [open, setOpen] = useState(false);
  const accordionColor = open ? '#FFF' : '#FFF';

  const [sectionState, setRange, setBinprop] = useSection(data);

  const ranges = Object.entries(data.ranges).map(([name, range]) => (
    <RangeSlider
      key={name}
      id={name}
      label={name}
      range={range}
      value={sectionState.ranges[name]}
      onChange={setRange}
    />
  ));

  const binprops = Object.entries(data.binaryProps).map(([name, elements]) => {
    const items = elements.map((e) => ({
      name: e,
      value: sectionState.binaryProps[name][e],
    }));
    return <CheckboxGroup key={name} id={name} legend={name} onChange={setBinprop} items={items} />;
  });

  useEffect(
    () => setFilters((old) => updateFilters(old, name, sectionState)),
    [setFilters, sectionState, name]
  );

  return (
    <Accordion
      onChange={() => setOpen((s) => !s)}
      sx={{
        transition: 'all .35s',
        border: '1px solid rgb(0,0,0,.2)',
        borderStyle: 'solid none solid none',
        backgroundColor: accordionColor,
      }}
    >
      <AccordionSummary aria-controls="panel1a-content" id="panel1a-header">
        <Typography>{name}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {ranges}
        {binprops}
      </AccordionDetails>
    </Accordion>
  );
}
