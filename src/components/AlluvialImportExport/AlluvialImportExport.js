import React, { useMemo, useReducer, useState } from "react";

import { scaleLinear } from "d3-scale";
import { groups, max, sum } from 'd3-array'
import { formatNumber, partialCirclePathD } from "../../utils/misc";
import iwanthue from 'iwanthue';

import { AnimatedPath, AnimatedGroup, AnimatedRect } from '../AnimatedSvgElements';

import './AlluvialImportExport.scss';

/**
 * @typedef Line
 * @type {object}
 * @property {'Exports' | 'Imports'} importsexports
 * @property {String} port
 * @property {'detail_products'} aggregate_type
 * @property {'Monde' | 'Colonies' | 'Fraude'} partner_type
 * @property {String} product_type
 * @property {Number} value
 */

/**
 * @param {Object} props
 * @param {Line[]} props.data
 * @param {Object} props.dimensions
 * @param {Number} props.dimensions.width
 * @param {Number} props.dimensions.height
 * @param {Object} props.colorPalette
 * @returns {React.ReactElement}
 */

export default function AlluvialImportExport({
  data: inputData,
  dimensions,
  colorPalette = {},
  ...props
}) {
  const [focus, setFocus] = useReducer((currentState, action) => {
    let { actionType, itemType, itemValue, mode } = action;
    if (currentState && itemValue === currentState.itemValue) { actionType = 'reset' }
    switch (actionType) {
      case 'set':
        return {
          itemType,
          itemValue,
          mode
        }
      case 'reset':
        return undefined;
    }
  }, undefined);

  const { width, height } = dimensions;
  const barWidth = 70;

  function sortEntriesByValue([aName, aValue], [bName, bValue]) {
    if (aValue < bValue) { return -1; }
    if (aValue > bValue) { return 1; }
    return 0;
  }

  const data = useMemo(() => {
    // sort to get 'fraude' partner type on top of alluvial
    inputData = inputData.sort(({ partner_type: aPartner }) => {
      if (aPartner === 'Fraude') { return -1; }
      if (aPartner !== 'Fraude') { return 1; }
      return 0;
    })
    if (focus && focus.mode === 'filter') {
      switch (focus.itemType) {
        case 'product':
          return inputData.filter(({ product_type }) => product_type === focus.itemValue);
        case 'partner':
          return inputData.filter(({ partner_type }) => partner_type === focus.itemValue);
      }
    }
    if (focus && focus.mode === 'highlight') {
      switch (focus.itemType) {
        case 'product':
          return inputData.map((row) => {
            if (row['product_type'] === focus.itemValue) {
              return {
                isHighlight: true,
                ...row
              }
            }
            return {
              isHighlight: false,
              ...row
            }
          })
        case 'partner':
          return inputData.map((row) => {
            if (row['partner_type'] === focus.itemValue) {
              return {
                isHighlight: true,
                ...row
              }
            }
            return {
              isHighlight: false,
              ...row
            }
          })
      }
    }
    return inputData;
  }, [inputData, focus])

  const products = useMemo(function groupProducts() {
    return groups(data, d => d.product_type);
  }, [data]);

  const partners = useMemo(function groupPartners() {
    return groups(data, d => d.partner_type);
  }, [data]);

  const {
    productBarHeight,
    partnerBarHeight,
    centerCircleHeight,
    scaleValue,
    productsImportValue,
    partnersMaxValue
  } = useMemo(function getHeightForDraw() {
    /**
     * To size product bar,
     * need for each product the max value between imports and exports
     */
    let productsImportValue = products.map(([product, productArray]) => {
      let productImportArray = [], productExportArray = [];
      for (const item of productArray) {
        switch (item['importsexports']) {
          case 'Imports':
            productImportArray.push(item); continue;
          case 'Exports':
            productExportArray.push(item); continue;
        }
      }
      const productImportTotal = sum(productImportArray, d => d.value);
      const productExportTotal = sum(productExportArray, d => d.value);
      return [
        product,
        max([productImportTotal, productExportTotal])
      ];
    });
    const productsTotalImportValue = sum(productsImportValue, d => d[1]);
    productsImportValue = Object.fromEntries(productsImportValue);

    /**
     * To size partner bar,
     * need for each partner the max value between imports and exports
     */
    let partnersMaxValue = partners.map(([partner, partnerArray]) => {
      if (partner === 'Fraude') { return [partner, 0]; }
      let partnerImportArray = [];
      let partnerExportArray = [];
      for (const { importsexports, value } of partnerArray) {
        switch (importsexports) {
          case 'Imports': partnerImportArray.push(value); continue;
          case 'Exports': partnerExportArray.push(value); continue;
        }
      }
      return [
        partner,
        max([
          sum(partnerImportArray),
          sum(partnerExportArray)
        ])
      ]
    });
    const partnerTotalValue = sum(partnersMaxValue, d => d[1]);
    partnersMaxValue = Object.fromEntries(partnersMaxValue);

    /**
     * Size of the center loop draw
     */
    const centerCircleHeight = 50;

    const scaleValue = scaleLinear()
      .domain([0, sum([productsTotalImportValue, partnerTotalValue])])
      .range([0, height - centerCircleHeight]);

    return {
      productBarHeight: scaleValue(productsTotalImportValue),
      partnerBarHeight: scaleValue(partnerTotalValue),
      centerCircleHeight,
      scaleValue,
      productsImportValue,
      partnersMaxValue
    }
  }, [height, products, partners]);

  /**
   * We sum the value, item by item, to increment the value and deduce the 'y'
   * position of product/partners.
   */

  const {
    productsDraw, // each product with its initial value, sum with previous elements, ready to be scaled on pixels ('y' position)
    partnersDraw,
    links // each data line, refactor as a directionnal link, 'from' -> 'to
  } = useMemo(function positionElements() {
    const productsImportSorted = Object.entries(productsImportValue).sort(sortEntriesByValue);
    const productsDraw = [];
    let iProductsImportValue = 0;
    for (const [product, value] of productsImportSorted) {
      productsDraw.push([
        product,
        iProductsImportValue
      ]);
      iProductsImportValue += value;
    }

    const partnersMaxSorted = Object.entries(partnersMaxValue).sort(sortEntriesByValue);
    const partnersDraw = [];
    let iPartnersImportValue = 0;
    for (const [partner, value] of partnersMaxSorted) {
      partnersDraw.push([
        partner,
        iPartnersImportValue
      ]);
      iPartnersImportValue += value;
    }

    const links = {
      ['Imports']: [], // left side
      ['Exports']: [] // right side
    };
    // dict to increment value ('y' position) for each product/partner, on left side and right side
    const iProduct = {
      ['Imports']: Object.fromEntries(productsDraw),
      ['Exports']: Object.fromEntries(productsDraw)
    };
    const iPartner = {
      ['Imports']: Object.fromEntries(partnersDraw),
      ['Exports']: Object.fromEntries(partnersDraw)
    };

    for (const [product, productArray] of products) {
      for (const { value, partner_type, importsexports, isHighlight } of productArray) {
        const yProduct = iProduct[importsexports][product];
        const yPartner = iPartner[importsexports][partner_type];
        const isFraude = partner_type === 'Fraude';
        let item = {
          value,
          product,
          isFraude,
          isHighlight
        };
        switch (importsexports) {
          case 'Imports':
            item = {
              ...item,
              from: {
                partner_type,
                y: scaleValue(yPartner)
              },
              to: {
                product,
                y: scaleValue(yProduct)
              }
            }
            break;

          case 'Exports':
            item = {
              ...item,
              from: {
                product,
                y: scaleValue(yProduct)
              },
              to: {
                partner_type,
                y: scaleValue(yPartner)
              }
            }
            break;
        }
        links[importsexports].push(item);
        iProduct[importsexports][product] += value; // increment
        iPartner[importsexports][partner_type] += value;
      }
    }
    return {
      links,
      productsDraw,
      partnersDraw
    };
  }, [products, partners, scaleValue]);

  const labelMargin = 2;

  return (
    <svg
      {...{
        width,
        height
      }}
      className="AlluvialImportExport"
    >
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill='transparent'
        onMouseMove={() => {
          if (focus) {
            setFocus({ actionType: 'reset' })
          }
        }}
      />
      <defs>
        <marker id='arrow-head' orient='auto' markerWidth='10' markerHeight='6' refX='0.1' refY='2'>
          <path d='M0,0 V4 L2,2 Z' fill='black' />
        </marker>
        <marker id='arrow-head-white' orient='auto' markerWidth='20' markerHeight='12' refX='0.1' refY='4'>
          <path d='M0,0 V8 L4,4 Z' fill='black' />
        </marker>
      </defs>
      <AnimatedGroup
        className="product-bar"
        transform={`translate(${width / 2 - barWidth / 2}, ${0})`}
      >
        {
          productsDraw.map(([product, y], i) => {
            y = scaleValue(y);
            const productScale = scaleValue(productsImportValue[product]);
            const color = colorPalette[product] || iwanthue(1, { seed: product });
            const isTooSmallForText = productScale < 25;
            const isNotHighlight = (focus && focus.mode === 'highlight' && focus.itemValue !== product)
            return (
              <g
                transform={`translate(${0}, ${y})`}
                onDoubleClick={() => setFocus({
                  actionType: 'set',
                  itemType: 'product',
                  mode: 'filter',
                  itemValue: product
                })}
                onClick={
                  () => setFocus({
                    actionType: 'set',
                    itemType: 'product',
                    mode: 'highlight',
                    itemValue: product
                  })
                }
                onMouseMove={
                  () => {
                    if (!(focus && focus.itemType === 'product' && focus.itemValue === product))
                      setFocus({
                        actionType: 'set',
                        itemType: 'product',
                        mode: 'highlight',
                        itemValue: product
                      })
                  }
                }
                key={i}
                className="modality-group"
              >
                <AnimatedRect
                  x={0}
                  y={0}
                  width={barWidth}
                  height={productScale}
                  fill={color}
                  opacity={(isNotHighlight ? 0.2 : 1)}
                  className="modality-rect"
                />
                {(isTooSmallForText === false || isNotHighlight === false) &&
                  <text
                    y={productScale / 2 + labelMargin}
                    x={barWidth / 2}
                    className="modality-label"
                  >
                    {product}
                  </text>
                }
              </g>
            )
          })
        }
      </AnimatedGroup>
      <AnimatedGroup
        className="partner-bar"
        transform={`translate(${width / 2 - barWidth / 2}, ${productBarHeight + centerCircleHeight})`}
      >
        {
          partnersDraw.map(([partner, y], i) => {
            y = scaleValue(y);
            const partnerScale = scaleValue(partnersMaxValue[partner]);
            const color = colorPalette[partner] || iwanthue(1, { seed: partner });
            return (
              <g
                transform={`translate(${0}, ${y})`}
                key={i}
                onDoubleClick={() => setFocus({
                  actionType: 'set',
                  itemType: 'partner',
                  mode: 'filter',
                  itemValue: partner
                })}
                onClick={
                  () => setFocus({
                    actionType: 'set',
                    itemType: 'partner',
                    mode: 'highlight',
                    itemValue: partner
                  })
                }
                onMouseMove={
                  () => {
                    if (!(focus && focus.itemType === 'partner' && focus.itemValue === partner))
                      setFocus({
                        actionType: 'set',
                        itemType: 'partner',
                        mode: 'highlight',
                        itemValue: partner
                      })
                  }
                }
                className="modality-group"
              >
                <rect
                  x={0}
                  y={0}
                  width={barWidth}
                  height={partnerScale}
                  fill={color}
                  className="modality-rect"
                />
                {
                  partner !== 'Fraude' &&
                  <text
                    y={partnerScale / 2 - labelMargin}
                    x={barWidth / 2}
                    className="modality-label"
                  >
                    {partner}
                  </text>
                }
              </g>
            )
          })
        }
      </AnimatedGroup>
      <g>
        {
          links['Imports'].map(({ from, to, value, product, isFraude, isHighlight }, i) => {
            const color = colorPalette[product] || iwanthue(1, { seed: product });
            const strokeWidth = scaleValue(value);
            const strokeWidthMiddle = strokeWidth / 2;
            const isTooSmallForText = strokeWidth < 25;
            return (
              <g
                transform={`translate(${width / 2 - barWidth / 2}, ${to.y + strokeWidthMiddle})`}
                key={i}
                className="flow-group import"
                // id={`from-${from.partner_type}-to-${to}-withproduct-${product.product_type}`}
                style={{
                  mixBlendMode: 'multiply'
                }}
              >
                {
                  isFraude ?
                    <>
                      <AnimatedPath
                        transform={'scale(-1,1)'}
                        d={`
                        M ${0} ${-strokeWidth / 2}
                        L ${width / 3 - 20} ${-strokeWidth / 2}
                        L ${width / 3 - 40} ${0}
                        L ${width / 3 - 20} ${strokeWidth / 2}
                        L ${0} ${strokeWidth / 2}
                        Z
                        `
                        }
                        fill={color}
                        fillOpacity={.5}
                        opacity={(focus && focus.mode === 'highlight' && isHighlight === false ? 0.2 : 1)}

                      />
                      <AnimatedPath
                        transform={'scale(-1,1)'}

                        d={`
                        M ${0} ${-strokeWidth / 2}
                        L ${width / 3 - 20} ${-strokeWidth / 2}
                        L ${width / 3 - 40} ${0}
                        L ${width / 3 - 20} ${strokeWidth / 2}
                        L ${0} ${strokeWidth / 2}
                        Z
                        `
                        }
                        fill={'url(#diagonalHatch)'}
                        opacity={(focus && focus.mode === 'highlight' && isHighlight === false ? 0.2 : 1)}
                        onMouseMove={
                          () => {
                            if (!(focus && focus.itemType === 'product' && focus.itemValue === product)) {
                              setFocus({
                                actionType: 'set',
                                itemType: 'product',
                                mode: 'highlight',
                                itemValue: product
                              })
                            }
                          }
                        }
                      />
                    </>
                    :
                    <AnimatedPath
                      d={
                        partialCirclePathD(
                          0,
                          (height - (to.y) - (partnerBarHeight - from.y)) / 2,
                          (height - (to.y) - (partnerBarHeight - from.y)) / 2,
                          Math.PI / 2,
                          Math.PI * 3 / 2,
                        )
                      }
                      strokeWidth={strokeWidth}
                      stroke={color}
                      fill='transparent'

                      opacity={(focus && focus.mode === 'highlight' && isHighlight === false ? 0.2 : 1)}
                    />
                }
                {
                  !isTooSmallForText &&
                  <AnimatedPath
                    className="dashed-flow-arrow"
                    d={
                      isFraude ?
                        `
                                            M ${0} ${0}
                                            L ${width} ${0}
                                            `
                        :
                        partialCirclePathD(
                          0,
                          (height - (to.y) - (partnerBarHeight - from.y)) / 2,
                          (height - (to.y) - (partnerBarHeight - from.y)) / 2,
                          Math.PI / 2,
                          Math.PI * 3 / 2,
                        )
                    }
                    strokeWidth={'1'}
                    stroke='black'
                    strokeDasharray='5, 5'
                    fill={'none'}
                    markerEnd='url(#arrow-head-white)'
                    opacity={(focus && focus.mode === 'highlight' && isHighlight === false ? 0.05 : .5)}
                  />
                }

                {isTooSmallForText === false &&
                  <text x={-5} y={5} className="number-label left">
                    {formatNumber(value) + ' lt.'}
                  </text>
                }
              </g>
            )
          })
        }
        {
          links['Exports']
            .reverse()
            .map(({ from, to, value, product, isFraude, isHighlight }, i) => {
              const color = colorPalette[product] || iwanthue(1, { seed: product });
              const strokeWidth = scaleValue(value);
              const strokeWidthMiddle = strokeWidth / 2;
              const isTooSmallForText = strokeWidth < 25;

              return (
                <g
                  transform={`translate(${width / 2 + barWidth / 2}, ${from.y + strokeWidthMiddle})`}
                  key={i}
                  className="flow-group export"
                  id={`from-${from.product}-to-${to.partner_type}`}
                  style={{
                    mixBlendMode: 'multiply'
                  }}

                >
                  {
                    isFraude ?
                      <>
                        <AnimatedPath
                          d={`
                        M ${0} ${-strokeWidth / 2}
                        L ${width / 3 - 20} ${-strokeWidth / 2}
                        L ${width / 3} ${0}
                        L ${width / 3 - 20} ${strokeWidth / 2}
                        L ${0} ${strokeWidth / 2}
                        Z
                        `
                          }
                          fill={color}
                          fillOpacity={.5}
                          opacity={(focus && focus.mode === 'highlight' && isHighlight === false ? 0.2 : 1)}

                        />
                        <AnimatedPath
                          d={`
                        M ${0} ${-strokeWidth / 2}
                        L ${width / 3 - 20} ${-strokeWidth / 2}
                        L ${width / 3} ${0}
                        L ${width / 3 - 20} ${strokeWidth / 2}
                        L ${0} ${strokeWidth / 2}
                        Z
                        `
                          }
                          fill={'url(#diagonalHatch)'}
                          opacity={(focus && focus.mode === 'highlight' && isHighlight === false ? 0.2 : 1)}
                          onMouseMove={
                            () => {
                              if (!(focus && focus.itemType === 'product' && focus.itemValue === product)) {
                                setFocus({
                                  actionType: 'set',
                                  itemType: 'product',
                                  mode: 'highlight',
                                  itemValue: product
                                })
                              }
                            }
                          }
                        />
                      </>
                      :
                      <>
                        <AnimatedPath
                          transform='scale(-1, 1)'
                          d={
                            partialCirclePathD(
                              0,
                              (height - (from.y) - (partnerBarHeight - to.y)) / 2,
                              (height - (from.y) - (partnerBarHeight - to.y)) / 2,
                              Math.PI / 2,
                              Math.PI * 3 / 2,
                            )
                          }
                          strokeWidth={strokeWidth}
                          fill='transparent'
                          stroke={color}
                          opacity={(focus && focus.mode === 'highlight' && isHighlight === false ? 0.2 : 1)}
                        />
                        {
                          !isTooSmallForText &&
                          <AnimatedPath
                            transform='scale(-1, 1)'
                            className="dashed-flow-arrow"
                            d={
                              partialCirclePathD(
                                0,
                                (height - (from.y) - (partnerBarHeight - to.y)) / 2,
                                (height - (from.y) - (partnerBarHeight - to.y)) / 2,
                                Math.PI * 3 / 2,
                                Math.PI / 2,
                              )
                            }
                            strokeWidth={'1'}
                            stroke='black'
                            strokeDasharray='5, 5'
                            fill={'none'}
                            markerEnd='url(#arrow-head-white)'
                            opacity={(focus && focus.mode === 'highlight' && isHighlight === false ? 0.05 : .5)}
                          />
                        }

                      </>

                  }
                  {isTooSmallForText === false && <text x={5} y={5} className="number-label right">{`${formatNumber(value)} lt. ${isFraude ? ' (fraude ?)' : ''}`}</text>}
                </g>
              )
            })
        }
      </g>
      <g
        className="center-circle"
        transform={`translate(${width / 2 - barWidth / 2}, ${productBarHeight})`}
      >
        <g
          transform={`translate(${0}, ${centerCircleHeight / 2})`}
        >
          <path
            d={partialCirclePathD(
              0,
              0,
              centerCircleHeight * .4,
              Math.PI / 2,
              Math.PI * 3 / 2,
            )}
            strokeWidth={2}
            stroke='black'
            fill='transparent'
            markerEnd='url(#arrow-head)'
          />
          <text
            x={20}
            y={2}
            style={{ fontStyle: 'italic', fontSize: 10 }}
            textAnchor='end'
          >
            Imports
          </text>
        </g>
        <g
          transform={`translate(${barWidth}, ${centerCircleHeight / 2})`}
        >
          <path
            d={partialCirclePathD(
              0,
              0,
              centerCircleHeight * .4,
              Math.PI / 2,
              Math.PI * 3 / 2,
            )}
            strokeWidth={2}
            stroke='black'
            fill='transparent'
            markerEnd='url(#arrow-head)'
            transform='rotate(180)'
          />
          <text
            x={15}
            y={2}
            style={{ fontStyle: 'italic', fontSize: 10 }}
            textAnchor='end'
          >
            Exports
          </text>
        </g>
      </g>
      <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
        <path
          d="M-1,1 l2,-2
                M0,4 l4,-4
                M3,5 l2,-2"
          style={{
            stroke: 'grey',
            strokeWidth: 1
          }}
        />
      </pattern>
    </svg>
  )
}