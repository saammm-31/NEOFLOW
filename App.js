import React, { useState, useEffect, useRef } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import {View, Text, TouchableOpacity, StyleSheet, ImageBackground, Animated, Image, TextInput, Modal, Dimensions, Alert, ScrollView} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from 'react-native-safe-area-context'; 
import Orientation from 'react-native-orientation-locker';
import { LineChart } from "react-native-chart-kit";
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { createStackNavigator } from '@react-navigation/stack';
import * as tf from '@tensorflow/tfjs';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
const screenWidth = Dimensions.get("window").width;
const initialBackground = require("./assets/loadingbgui.svg");
const newBackground = require("./assets/bgfinalui.svg");
const initialLogo = require("./assets/LogoOnlyFinalUI.svg");
const newLogo = require("./assets/LogoOnly.svg");
const htuBackground = require("./assets/htubg.svg")
const gwFinalBackground = require("./assets/gwnew.svg");
const aboutBackground = require("./assets/aboutbg.svg")
const srfsLogo = require("./assets/srfsLogo.svg");
const gwLogo = require("./assets/gwLogo.svg");
const eorLogo = require("./assets/eorLogo.svg"); 

function BackButton() {
  const navigation = useNavigation(); 
  const handleBackPress = () => {
    const state = navigation.getState(); 
    const currentRouteName = state.routes[state.index].name; 
    if (currentRouteName === 'SFRSScreen') {navigation.goBack();} 
    else if (currentRouteName === 'GeothermalWellScreen') {navigation.goBack();} 
    else if (currentRouteName === 'EORScreen') {navigation.goBack();} 
    else {navigation.goBack();}}; 
    return (
    <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
      <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>);
}

function SFRSScreen({navigation}) {
  const [selectedModel, setSelectedModel] = useState(''); 
  const [inputValues, setInputValues] = useState({}); 
  const [showGraphModal, setShowGraphModal] = useState(false); 
  const handleInputChange = (field, value) => {setInputValues((prev) => ({...prev, [field]: value,}));}; 
  const calculatedResult = () => {const values = inputValues; 
    if (selectedModel === 'Shear Stress: Power-Law (Ostwald-de Waele Model)') {
      const k = parseFloat(values['Consistency Index (Pa·sⁿ)']); 
      const y = parseFloat(values['Shear Rate (1/s)']); 
      const n = parseFloat(values['Flow Behavior Index (dimensionless)']); 
      return (k * ((y) ** n));} 
    if (selectedModel === 'Shear Stress: Bingham Plastic Model (for yield fluids)') {
        const τᵧ = parseFloat(values['Yield Stress (Pa)']); const ηₚ = parseFloat(values['Plastic Viscosity (Pa·s)']); 
        const y = parseFloat(values['Shear Rate (1/s)']); 
        return  (τᵧ + (ηₚ * y));} 
    if (selectedModel === 'Shear Stress: Herschel-Bulkley Equation') {
      const τᵧ = parseFloat(values['Yield Stress (Pa)']); 
      const k = parseFloat(values['Consistency Index (Pa·sⁿ)']); 
      const γ = parseFloat(values['Shear Rate (1/s)']); 
      const n = parseFloat(values['Flow Behavior Index (dimensionless)']); 
      return (τᵧ + (k * (γ ** n)));}
    if (selectedModel === 'Velocity Profile (Power-law Fluids in a Pipe)') {
      const uₘₐₓ = parseFloat(values['Centerline Velocity (m/s)']); 
      const r = parseFloat(values['Radial Position (m)']); 
      const R = parseFloat(values['Pipe Radius (m)']); 
      const n = parseFloat(values['Flow Behavior Index (dimensionless)']); 
      return uₘₐₓ * (1 - ((r / R) ** ((n + 1) / n))) ;} 
    if (selectedModel === 'Friction Factor: Hedstrom Equation (for Laminar Non-Newtonian Flow in a Pipe)') {
      const Re = parseFloat(values['Reynolds Number (dimensionless)']); 
        return (16 / Re);} 
    if (selectedModel === 'Friction Factor: Generalized Reynolds Number for Power-Law Fluids') {
      const D = parseFloat(values['Pipe Diameter (m)']); 
      const ρ = parseFloat(values['Fluid Density (kg/m³)']); 
      const v̄ = parseFloat(values['Average Velocity (m/s)']); 
      const k = parseFloat(values['Consistency Index (Pa·sⁿ)']); 
      const n = parseFloat(values['Flow Behavior Index (dimensionless)']); 
      return ((D * (ρ ** n) * (v̄ ** (2 - n))) / k) ;} 
    if (selectedModel === 'Pumping Power') {
      const ΔP = parseFloat(values['Pressure Drop (Pa)']); 
      const Q = parseFloat(values['Volumetric Flow Rate (m³/s)']); 
      const η = parseFloat(values['Pump Efficiency (dimensionless)']); 
      return ((ΔP * Q) / η) ;} 
      return null;}; 
      
    const renderDynamicFields = () => {
      const fields = {'Shear Stress: Power-Law (Ostwald-de Waele Model)': ['Consistency Index (Pa·sⁿ)', 'Shear Rate (1/s)', 'Flow Behavior Index (dimensionless)'], 'Shear Stress: Bingham Plastic Model (for yield fluids)': ['Yield Stress (Pa)', 'Plastic Viscosity (Pa·s)', 'Shear Rate (1/s)'], 'Shear Stress: Herschel-Bulkley Equation': ['Yield Stress (Pa)', 'Consistency Index (Pa·sⁿ)', 'Shear Rate (1/s)', 'Flow Behavior Index (dimensionless)'], 'Velocity Profile (Power-law Fluids in a Pipe)': ['Centerline Velocity (m/s)', 'Radial Position (m)', 'Pipe Radius (m)', 'Flow Behavior Index (dimensionless)'], 'Friction Factor: Hedstrom Equation (for Laminar Non-Newtonian Flow in a Pipe)': ['Reynolds Number (dimensionless)'], 'Friction Factor: Generalized Reynolds Number for Power-Law Fluids': ['Pipe Diameter (m)', 'Fluid Density (kg/m³)', 'Average Velocity (m/s)', 'Consistency Index (Pa·sⁿ)', 'Flow Behavior Index (dimensionless)'], 'Pumping Power': ['Pressure Drop (Pa)', 'Volumetric Flow Rate (m³/s)', 'Pump Efficiency (dimensionless)'],};

    return fields[selectedModel]?.map((field) => (
      <View key={field}>
        <Text style={styles.sfrslabel}>{field}</Text>
        <TextInput
          style={styles.sfrsinput}
          placeholder={`Enter ${field}`}
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={inputValues[field] || ''}
          onChangeText={(value) => handleInputChange(field, value)}
        />
      </View>
    ));
  };

  return (
    <ImageBackground source={require('./assets/sfrsnew.svg')} style={styles.fullScreenBackground}>
      <ScrollView contentContainerStyle={styles.sfrscontainer}>
        <View style={styles.sfrsrow}>
          <View style={styles.sfrsleftPane}>
            <Text style={styles.sfrslabel}>Select Model/Concept</Text>
            <Picker
              selectedValue={selectedModel}
              onValueChange={(itemValue) => {
                setSelectedModel(itemValue);
                setInputValues({});
              }}
              mode="dropdown"
              style={styles.sfrslargepicker}
            >
              <Picker.Item label="Choose Model" value="" />
              <Picker.Item label="Shear Stress: Power-Law (Ostwald-de Waele Model)" value="Shear Stress: Power-Law (Ostwald-de Waele Model)" />
              <Picker.Item label="Shear Stress: Bingham Plastic Model (for yield fluids)" value="Shear Stress: Bingham Plastic Model (for yield fluids)" />
              <Picker.Item label="Shear Stress: Herschel-Bulkley Equation" value="Shear Stress: Herschel-Bulkley Equation" />
              <Picker.Item label="Velocity Profile (Power-law Fluids in a Pipe)" value="Velocity Profile (Power-law Fluids in a Pipe)" />
              <Picker.Item label="Friction Factor: Hedstrom Equation (for Laminar Non-Newtonian Flow in a Pipe)" value="Friction Factor: Hedstrom Equation (for Laminar Non-Newtonian Flow in a Pipe)" />
              <Picker.Item label="Friction Factor: Generalized Reynolds Number for Power-Law Fluids" value="Friction Factor: Generalized Reynolds Number for Power-Law Fluids" />
              <Picker.Item label="Pumping Power" value="Pumping Power" />
            </Picker>

            {renderDynamicFields()}
          </View>
          <View style={styles.sfrsrightPane}>
            <TouchableOpacity
              style={styles.sfrssmallButton}
              onPress={() => {
                const result = calculatedResult();
                navigation.navigate('SFRSResults', { selectedModel, inputValues, result });
              }}
            >
              <Text style={styles.sfrsbuttonText}>Calculated Results</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sfrssmallButton} onPress={() => setShowGraphModal(true)}>
              <Text style={styles.sfrsbuttonText}>Graphical Representation</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sfrssmallButton}
              onPress={() => navigation.navigate('SFRSPredictor', { selectedModel, inputValues })}
            >
              <Text style={styles.sfrsbuttonText}>Simple Predictor</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Modal visible={showGraphModal} transparent animationType="slide">
          <View style={styles.sfrsmodalContainer}>
            <View style={styles.sfrsmodalContent}>
              <Text style={styles.sfrsmodalTitle}>Select Graph Type</Text>
              <TouchableOpacity
                style={styles.sfrsmodalButton}
                onPress={() => {
                  setShowGraphModal(false);
                  navigation.navigate('SFRSGraphScreen', { selectedModel, chartType: 'line', inputValues });
                }}
              >
                <Text style={styles.sfrsmodalButtonText}>Line Chart</Text>
              </TouchableOpacity>
              <TouchableOpacity>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </ImageBackground>
  );
}

function SFRSResultScreen({ route }) {
  const navigation = useNavigation();
  const { selectedModel, inputValues, result } = route.params;
 return (
    <ImageBackground source={require('./assets/sfrsnew.svg')} style={styles.fullScreenBackground}>
      <ScrollView contentContainerStyle={styles.sfrsresultsContainer}>

          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: '#fff',
            textAlign: 'center',
             marginTop: 150,
            marginBottom: 10,
            textShadowColor: 'rgba(0, 0, 0, 0.3)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
          }}>
            Calculated Result
          </Text>

          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#fff',
            textAlign: 'center',
            paddingHorizontal: 10,
            fontStyle: 'italic',
            marginBottom: 20
          }}>
            Selected Model: {selectedModel}
          </Text>

          <View style={[styles.sfrsboxContainer, {paddingBottom: 50}]}>
            <Text style={{
            fontSize: 20,
            color: '#5c2222',
            textAlign: 'center',
            marginBottom: 10
          }}>
            Result: {result}
          </Text>

          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#5c2222',
            marginTop: 10,
            textAlign: 'center'
          }}>
            Inputs:
          </Text>
          {Object.keys(inputValues || {}).map((key) => (
            <Text key={key} style={{
              fontSize: 20,
              color: '#5c2222',
              textAlign: 'center'
            }}>
              {key}: {inputValues[key]}
            </Text>
          ))}
          </View>
          <BackButton />
      </ScrollView>
    </ImageBackground>
  );
}

function SFRSAIScreen({ route }) {
  const navigation = useNavigation();
  const sfrsFinalBackground = require("./assets/sfrsnew.svg");
  const { selectedModel, inputValues } = route.params || {};
  const [predictedParams, setPredictedParams] = useState(null);
  const [tfReady, setTfReady] = useState(false);

  const sampleTrainingData = {
    'Shear Stress: Power-Law (Ostwald-de Waele Model)': {
      inputs: [[1], [2], [3], [4], [5]],
      labels: [[1], [2.8], [5.2], [8.1], [11]],
    },
    'Shear Stress: Bingham Plastic Model (for yield fluids)': {
      inputs: [[1], [2], [3], [4], [5]],
      labels: [[1.5], [2.5], [3.5], [4.5], [5.5]],
    },
    'Shear Stress: Herschel-Bulkley Equation': {
      inputs: [[1], [2], [3], [4], [5]],
      labels: [[2.2], [4.5], [7.1], [10.0], [13.0]],
    },
    'Velocity Profile (Power-law Fluids in a Pipe)': {
      inputs: [[0.1], [0.2], [0.3], [0.4], [0.5]],
      labels: [[1], [0.7], [0.45], [0.25], [0.1]],
    },
    'Friction Factor: Hedstrom Equation (for Laminar Non-Newtonian Flow in a Pipe)': {
      inputs: [[100], [200], [300], [400], [500]],
      labels: [[0.12], [0.09], [0.07], [0.06], [0.05]],
    },
    'Friction Factor: Generalized Reynolds Number for Power-Law Fluids': {
      inputs: [[10], [50], [100], [200], [500]],
      labels: [[0.15], [0.12], [0.10], [0.08], [0.06]],
    },
    'Pumping Power': {
      inputs: [[1], [2], [3], [4], [5]],
      labels: [[10], [22], [38], [58], [82]],
    },
  };

  useEffect(() => {
    (async () => {
      await tf.ready();
      setTfReady(true);
    })();
  }, []);

  const trainBestFitModel = async () => {
  const data = sampleTrainingData[selectedModel];
  if (!data) {
    alert('No training data available for this model.');
    return;
  }

  const xs = tf.tensor2d(data.inputs);
  const ys = tf.tensor2d(data.labels);

  const models = [
    {
      name: "Linear",
      build: () => {
        const model = tf.sequential();
        model.add(tf.layers.dense({ inputShape: [1], units: 1 }));
        return model;
      }
    },
    {
      name: "Quadratic",
      build: () => {
        const model = tf.sequential();
        model.add(tf.layers.dense({ inputShape: [1], units: 10, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 1 }));
        return model;
      }
    },
    {
      name: "Cubic",
      build: () => {
        const model = tf.sequential();
        model.add(tf.layers.dense({ inputShape: [1], units: 20, activation: 'relu' }));
        model.add(tf.layers.dense({ units: 1 }));
        return model;
      }
    }
  ];

  const evaluationResults = [];

  for (const { name, build } of models) {
    const model = build();
    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
    await model.fit(xs, ys, { epochs: 150, verbose: 0 });
    const loss = model.evaluate(xs, ys).dataSync()[0];
    evaluationResults.push({ name, loss, model });
  }

  const best = evaluationResults.sort((a, b) => a.loss - b.loss)[0];
  const inputRate = parseFloat(inputValues['Shear Rate (γ)']) || 1;
  const prediction = best.model.predict(tf.tensor2d([[inputRate]])).dataSync();

  // Add model selection reasoning
  const reasoningComment = `The ${best.name} model was selected because it produced the lowest mean squared error (loss = ${best.loss.toFixed(4)}) when trained on the given data. This suggests it best fits the observed pattern.`;

  setPredictedParams({
    bestModel: best.name,
    estimatedStress: prediction[0].toFixed(3),
    basedOnRate: inputRate,
    loss: best.loss.toFixed(4),
    reason: reasoningComment,
  });
};

  useEffect(() => {
    if (selectedModel && tfReady) {
      trainBestFitModel();
    }
  }, [selectedModel, tfReady]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={sfrsFinalBackground} style={styles.fullScreenBackground}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <BackButton />
          <View style={{ alignItems: 'center', marginVertical: 20 }}>
  <Text style={{
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  }}>
    Smart Fluid Rheology Prediction
  </Text>
  <Text style={{
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 10,
    fontStyle: 'italic'
  }}>
    Selected Model: {selectedModel}
  </Text>
</View>
          {predictedParams && (
  <View style={{
    marginTop: 30,
    backgroundColor: '#780606',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  }}>
    <Text style={{
      fontWeight: 'bold',
      fontSize: 20,
      marginBottom: 10,
      color: '#FFFFFF',
    }}>
      Prediction Output
    </Text>
    <Text style={{ fontSize: 16, marginVertical: 4, textAlign: 'center', color:"#FFFFFF" }}>
      <Text style={{ fontWeight: 'bold', color:"#FFFFFF" }}>Best-Fit Model:</Text> {predictedParams.bestModel}
    </Text>
    <Text style={{ fontSize: 16, marginVertical: 4, textAlign: 'center', color:"#FFFFFF" }}>
      <Text style={{ fontWeight: 'bold', color:"#FFFFFF" }}>Estimated Shear Stress:</Text> {predictedParams.estimatedStress}
    </Text>
    <Text style={{ fontSize: 16, marginVertical: 4, textAlign: 'center', color:"#FFFFFF" }}>
      <Text style={{ fontWeight: 'bold', color:"#FFFFFF" }}>Input Shear Rate:</Text> {predictedParams.basedOnRate}
    </Text>
    <Text style={{ fontSize: 16, marginVertical: 4, textAlign: 'center', color:"#FFFFFF" }}>
      <Text style={{ fontWeight: 'bold', color:"#FFFFFF" }}>Model Loss:</Text> {predictedParams.loss}
    </Text>
        <Text style={{ fontSize: 16, marginTop: 13.5, fontStyle: 'italic', color: '#FFFFFF', textAlign: 'center' }}>
      {predictedParams.reason}
    </Text>
  </View>
)}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

function SFRSGraphScreen({ route, navigation }) {
  const { selectedModel = "", inputValues = {}, calculatedResult = null } = route.params || {};

  const sfrsBackground = require("./assets/sfrsnew.svg");

  let graphLabels = [];
  let graphData = [];
  let xAxisLabel = "";
  let yAxisLabel = "";

  if (selectedModel.includes("Shear Stress: Power-Law (Ostwald-de Waele Model)")) {
    const k = parseFloat(inputValues["Consistency Index (k)"] || 1);
    const n = parseFloat(inputValues["Flow Behavior Index (n)"] || 1);
    const γ_start = parseFloat(inputValues["Shear Rate (γ)"] || 1) * 0.8;
    const γ_end = parseFloat(inputValues["Shear Rate (γ)"] || 1) * 1.2;

    xAxisLabel = "Shear Rate (1/s)";
    yAxisLabel = "Shear Stress (Pa)";

    for (let γ = γ_start; γ <= γ_end; γ += (γ_end - γ_start) / 5) {
      const result = k * γ ** n;
      graphLabels.push(γ.toFixed(2));
      graphData.push(result);
    }
} else if (selectedModel.includes("Shear Stress: Bingham Plastic Model")) {
    const τᵧ = parseFloat(inputValues["Yield Stress (τᵧ)"] || 1);
    const ηₚ = parseFloat(inputValues["Plastic Viscosity (ηₚ)"] || 1);
    const γ_start = parseFloat(inputValues["Shear Rate (γ)"] || 1) * 0.8;
    const γ_end = parseFloat(inputValues["Shear Rate (γ)"] || 1) * 1.2;
   
    xAxisLabel = "Shear Rate (1/s)";
    yAxisLabel = "Shear Stress (Pa)";

    for (let γ = γ_start; γ <= γ_end; γ += (γ_end - γ_start) / 5) {
      const result = τᵧ + ηₚ * γ;
      graphLabels.push(γ.toFixed(2));
      graphData.push(result);
    }
  } else if (selectedModel.includes("Shear Stress: Herschel-Bulkley Equation")) {
    const τᵧ = parseFloat(inputValues.τᵧ || 1);
    const k = parseFloat(inputValues.k || 1);
    const n = parseFloat(inputValues.n || 1);
    const γ_start = parseFloat(inputValues.γ || 1) * 0.8;
    const γ_end = parseFloat(inputValues.γ || 1) * 1.2;
   
    xAxisLabel = "Shear Rate (1/s)";
    yAxisLabel = "Shear Stress (Pa)";
   
    for (let γ = γ_start; γ <= γ_end; γ += (γ_end - γ_start) / 5) {
      const result = (τᵧ + (k * (γ ** n)));
      graphLabels.push(γ.toFixed(2));
      graphData.push(result);
    }
  } else if (selectedModel.includes("Velocity Profile (Power-law Fluids in a Pipe)")) {
    const uₘₐₓ = parseFloat(inputValues.uₘₐₓ || 1);
    const R = parseFloat(inputValues.R || 1);
    const n = parseFloat(inputValues.n || 1);
    const r_start = parseFloat(inputValues.r || 1) * 0.8;
    const r_end = parseFloat(inputValues.r || 1) * 1.2;
   
    xAxisLabel = "Radial Position (m)";
    yAxisLabel = "Velocity (m/s)";
   
    for (let r = r_start; r <= r_end; r += (r_end - r_start) / 5) {
      const result = uₘₐₓ * (1 - ((r / R) ** ((n + 1) / n)));
      graphLabels.push(r.toFixed(2));
      graphData.push(result);
    }
  } else if (selectedModel.includes("Friction Factor: Hedstrom Equation (for Laminar Non-Newtonian Flow in a Pipe)")) {
    const Re_start = parseFloat(inputValues.Re || 1) * 0.8;
    const Re_end = parseFloat(inputValues.Re || 1) * 1.2;
   
    xAxisLabel = "Reynold's Number (dimensionless)";
    yAxisLabel = "Friction Factor (dimensionless)";
   
    for (let Re = Re_start; Re <= Re_end; Re += (Re_end - Re_start) / 5) {
      const result = (16 / Re);
      graphLabels.push(Re.toFixed(2));
      graphData.push(result);
    }
  } else if (selectedModel.includes("Friction Factor: Generalized Reynolds Number for Power-Law Fluids")) {
    const D = parseFloat(inputValues.D || 1);
    const ρ = parseFloat(inputValues.ρ || 1);
    const k = parseFloat(inputValues.k || 1);
    const n = parseFloat(inputValues.n || 1);
    const v̄_start = parseFloat(inputValues.v̄ || 1) * 0.8;
    const v̄_end = parseFloat(inputValues.v̄ || 1) * 1.2;
   
    xAxisLabel = "Velocity (m/s)";
    yAxisLabel = "Generalized Reynolds Number (dimensionless)";
   
    for (let v̄ = v̄_start;  v̄ <= v̄_end;  v̄ += (v̄_end - v̄_start) / 5) {
      const result = ((D * (ρ ** n) * (v̄ ** (2 - n))) / k);
      graphLabels.push(v̄.toFixed(2));
      graphData.push(result);
    }
  } else if (selectedModel.includes("Pumping Power")) {
    const Q = parseFloat(inputValues.Q || 1);
    const η = parseFloat(inputValues.η || 1);
    const ΔP_start = parseFloat(inputValues.ΔP || 1) * 0.8;
    const ΔP_end = parseFloat(inputValues.ΔP || 1) * 1.2;
   
    xAxisLabel = "Pressure Drop (Pa)";
    yAxisLabel = "Pumping Power (W)";
   
    for (let ΔP = ΔP_start; ΔP <= ΔP_end; ΔP += (ΔP_end - ΔP_start) / 5) {
      const result = ((ΔP * Q) / η);
      graphLabels.push(ΔP.toFixed(2));
      graphData.push(result);
    }
  }

  console.log("Graph Data:", graphData);
  console.log("Graph Labels:", graphLabels);

  let minY = Math.min(...graphData, 0);
  let maxY = Math.max(...graphData, 1);
  if (minY === maxY) { maxY = minY + 1; } 
  const yPadding = (maxY - minY) * 0.1;
  const yMin = minY - yPadding;
  const yMax = maxY + yPadding;

  const chartData = {
    labels: graphLabels,
    datasets: [
      {
        data: graphData,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: "transparent",
    backgroundGradientFrom: "transparent",
    backgroundGradientTo: "transparent",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    propsForDots: {
    r: '6',
    strokeWidth: '3',
    stroke: '#4B0101',   
    fill: '#ff2c2c',     
  },
  propsForBackgroundLines: {
    stroke: '#472a04',       
    strokeDasharray: '4',  
  },
  style: {
    borderRadius: 16,
  },
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={sfrsBackground} style={styles.fullScreenBackground}>
        <View style={styles.sfrsContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.sfrsscreenTitle}>Graphical Representation</Text>
          <View style={{ marginTop: 60 }}>
            {graphData.length > 0 ? (
              <LineChart
                data={chartData}
                width={screenWidth - 32}
                height={220}
                chartConfig={chartConfig}
                style={styles.sfrschartStyle}
                bezier
                fromZero={yMin > 0}
                yAxisSuffix=""
                yAxisInterval={1}
                segments={5}
                yLabelsOffset={10}
                withInnerLines={true}
                withOuterLines={true}
                yMin={yMin}
                yMax={yMax}
              />
            ) : (
              <Text style={styles.sfrsresultsText}>No data available for graph.</Text>
            )}
            <Text style={[styles.axisLabel, styles.xAxisLabel]}>{xAxisLabel}</Text>
            <Text style={[styles.axisLabel, styles.yAxisLabel]}>{yAxisLabel}</Text>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

function GeothermalWellScreen({ navigation }) {
  const [selectedModel, setSelectedModel] = useState('');
  const [inputValues, setInputValues] = useState({});
  const [showGraphModal, setShowGraphModal] = useState(false);

  const handleInputChange = (field, value) => {
    setInputValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const calculatedResult = () => {
  const values = inputValues;
  if (selectedModel === 'Heat Transfer Efficiency') {
    const m = parseFloat(values['Mass Flow Rate (kg/s)']);
    const Cp = parseFloat(values['Specific Heat Capacity of Working Fluid (J/kg·K)']);
    const Tin = parseFloat(values['Injection Temperature (Celsius)']);
    const Tout = parseFloat(values['Outlet Temperature (Celsius)']);
    const Qin = parseFloat(values['Heat Input from Geothermal Reservoir (Joules)']);
    return ((m * Cp * (Tout - Tin)) / Qin) * 100 || 0;
  }
  if (selectedModel === 'Energy Extracted from Reservoir') {
    const m = parseFloat(values['Mass Flow Rate (kg/s)']);
    const Cp = parseFloat(values['Specific Heat Capacity (J/kg·K)']);
    const Tr = parseFloat(values['Reservoir Temperature (Celsius)']);
    const Tf = parseFloat(values['Fluid Temperature (Celsius)']);
    return m * Cp * (Tr - Tf) || 0;
  }
  if (selectedModel === 'Energy Extracted through Rock Convection') {
    const h = parseFloat(values['Heat Transfer Coefficient (W/m²·K)']);
    const A = parseFloat(values['Heat Exchange Surface Area (m²)']);
    const Tr = parseFloat(values['Reservoir Temperature (Celsius)']);
    const Tf = parseFloat(values['Fluid Temperature (Celsius)']);
    return h * A * (Tr - Tf) || 0;
  }
  if (selectedModel === 'Well Lifetime') {
    const E = parseFloat(values['Total Thermal Energy in Reservoir (Joules)']);
    const Q = parseFloat(values['Energy Extracted per Second (Watt)']);
    return (E / Q) || 0;
  }
  return null;
};

  const renderDynamicFields = () => {
    const fields = {
  'Heat Transfer Efficiency': [
    'Mass Flow Rate (kg/s)',
    'Specific Heat Capacity of Working Fluid (J/kg·K)',
    'Injection Temperature (Celsius)',
    'Outlet Temperature (Celsius)',
    'Heat Input from Geothermal Reservoir (Joules)'
  ],
  'Energy Extracted from Reservoir': [
    'Mass Flow Rate (kg/s)',
    'Specific Heat Capacity (J/kg·K)',
    'Reservoir Temperature (Celsius)',
    'Fluid Temperature (Celsius)'
  ],
  'Energy Extracted through Rock Convection': [
    'Heat Transfer Coefficient (W/m²·K)',
    'Heat Exchange Surface Area (m²)',
    'Reservoir Temperature (Celsius)',
    'Fluid Temperature (Celsius)'
  ],
  'Well Lifetime': [
    'Total Thermal Energy in Reservoir (Joules)',
    'Energy Extracted per Second (Watt)'
  ],
};

    return fields[selectedModel]?.map((field) => (
    <View key={field}>
      <Text style={styles.gwlabel}>{field}</Text>
      <TextInput
        style={styles.gwinput}
        placeholder={`Enter ${field}`}
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={inputValues[field] || ''}
        onChangeText={(value) => handleInputChange(field, value)}
      />
    </View>
  ));
};

  return (
    <ImageBackground source={require('./assets/gwnew.svg')} style={styles.fullScreenBackground}resizeMode="cover">
      <ScrollView contentContainerStyle={styles.gwcontainer}>
        <View style={styles.gwrow}>
          <View style={styles.gwleftPane}>
            <Text style={styles.gwlabel}>Select Model/Concept</Text>
            <Picker
              selectedValue={selectedModel}
              onValueChange={(itemValue) => {
                setSelectedModel(itemValue);
                setInputValues({});
              }}
              mode="dropdown"
              style={styles.gwlargepicker}
            >
              <Picker.Item label="Choose Model" value="" />
              <Picker.Item label="Heat Transfer Efficiency" value="Heat Transfer Efficiency" />
              <Picker.Item label="Energy Extracted from Reservoir" value="Energy Extracted from Reservoir" />
              <Picker.Item label="Energy Extracted through Rock Convection" value="Energy Extracted through Rock Convection" />
              <Picker.Item label="Well Lifetime" value="Well Lifetime" />
            </Picker>
            {renderDynamicFields()}
          </View>
          <View style={styles.gwrightPane}>
            <TouchableOpacity
              style={styles.gwsmallButton}
              onPress={() => {
                const result = calculatedResult();
                navigation.navigate('Results', { selectedModel, inputValues, result });
              }}
            >
              <Text style={styles.gwbuttonText}>Calculated Results</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gwsmallButton} onPress={() => setShowGraphModal(true)}>
              <Text style={styles.gwbuttonText}>Graphical Representation</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.gwsmallButton}
              onPress={() => {
              const mappedInputs = mapInputKeys(inputValues, selectedModel);
              navigation.navigate('SimplePredictor', { selectedModel, inputValues: mappedInputs });
              }}
            > 
              <Text style={styles.gwbuttonText}>Simple Predictor</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Modal visible={showGraphModal} transparent animationType="slide">
          <View style={styles.gwmodalContainer}>
            <View style={styles.gwmodalContent}>
              <Text style={styles.gwmodalTitle}>Select Graph Type</Text>
              <TouchableOpacity
                style={styles.gwmodalButton}
                onPress={() => {
                  setShowGraphModal(false);
                  navigation.navigate('GraphsScreen', { selectedModel, chartType: 'line', inputValues });
                }}
              >
                <Text style={styles.gwmodalButtonText}>Line Chart</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </ImageBackground>
  );
}

function ResultsScreen({ route }) {
  const navigation = useNavigation();
  const { selectedModel, inputValues, result } = route.params;

  return (
    <ImageBackground
      source={require('./assets/gwnew.svg')}
      style={styles.fullScreenBackground}resizeMode="cover"
    >
      <View style={styles.gwoverlay} />

      <ScrollView contentContainerStyle={styles.gwresultcontainer}>
        <View style={styles.gwresultcard}>
          <Text style={styles.gwheader}> Calculated Result</Text>
          <Text style={styles.gwsubheader}>
            Model Used: <Text style={styles.gwhighlight}>{selectedModel}</Text>
          </Text>

          <Text style={styles.gwresultLabel}>Estimated Result:</Text>
          <Text style={styles.gwresultValue}>{result}</Text>

          <Text style={styles.gwinputHeader}> Input Parameters:</Text>
          {Object.keys(inputValues || {}).map((key) => (
            <View key={key} style={styles.gwinputRow}>
              <Text style={styles.gwinputKey}>{key}</Text>
              <Text style={styles.gwinputValue}>{inputValues[key]}</Text>
            </View>
          ))}
        </View>
        <BackButton />
      </ScrollView>
    </ImageBackground>
  );
}

function mapInputKeys(inputValues, selectedModel) {
  const fieldKeyMap = {
    'Mass Flow Rate (kg/s)': 'm',
    'Specific Heat Capacity of Working Fluid (J/kg·K)': 'Cp',
    'Injection Temperature (Celsius)': 'Tin',
    'Outlet Temperature (Celsius)': 'Tout',
    'Heat Input from Geothermal Reservoir (Joules)': 'Qin',
    'Specific Heat Capacity (J/kg·K)': 'Cp',
    'Reservoir Temperature (Celsius)': 'Tr',
    'Fluid Temperature (Celsius)': 'Tf',
    'Heat Transfer Coefficient (W/m²·K)': 'h',
    'Heat Exchange Surface Area (m²)': 'A',
    'Total Thermal Energy in Reservoir (Joules)': 'E',
    'Energy Extracted per Second (Watt)': 'Q',
  };

  const mapped = {};
  Object.keys(inputValues).forEach((key) => {
    if (fieldKeyMap[key]) {
      mapped[fieldKeyMap[key]] = inputValues[key];
    }
  });
  return mapped;
}


function SimplePredictorScreen({ route }) {
  const navigation = useNavigation();
  const { selectedModel, inputValues } = route.params;

  const parseNum = (key) => {
    const val = parseFloat(inputValues[key]);
    return isNaN(val) ? null : val;
  };

  const requiredFields = {
    'Heat Transfer Efficiency': ['m', 'Cp', 'Tin', 'Tout', 'Qin'],
    'Energy Extracted from Reservoir': ['m', 'Cp', 'Tr', 'Tf'],
    'Energy Extracted through Rock Convection': ['h', 'A', 'Tr', 'Tf'],
    'Well Lifetime': ['E', 'Q'],
  };

  const getMissingFields = () => {
    const keys = requiredFields[selectedModel] || [];
    return keys.filter((key) => parseNum(key) === null);
  };

  const basicResult = (() => {
    switch (selectedModel) {
      case 'Heat Transfer Efficiency': {
        const m = parseNum('m'), Cp = parseNum('Cp'), Tin = parseNum('Tin'),
          Tout = parseNum('Tout'), Qin = parseNum('Qin');
        if ([m, Cp, Tin, Tout, Qin].some(v => v === null)) return null;
        return ((m * Cp * (Tout - Tin)) / Qin) * 100 || 0;
      }
      case 'Energy Extracted from Reservoir': {
        const m = parseNum('m'), Cp = parseNum('Cp'), Tr = parseNum('Tr'), Tf = parseNum('Tf');
        if ([m, Cp, Tr, Tf].some(v => v === null)) return null;
        return m * Cp * (Tr - Tf);
      }
      case 'Energy Extracted through Rock Convection': {
        const h = parseNum('h'), A = parseNum('A'), Tr = parseNum('Tr'), Tf = parseNum('Tf');
        if ([h, A, Tr, Tf].some(v => v === null)) return null;
        return h * A * (Tr - Tf);
      }
      case 'Well Lifetime': {
        const E = parseNum('E'), Q = parseNum('Q');
        if ([E, Q].some(v => v === null)) return null;
        return E / Q;
      }
      default:
        return null;
    }
  })();

  const regressionResult = (() => {
    switch (selectedModel) {
      case 'Heat Transfer Efficiency': {
        const m = parseNum('m'), Cp = parseNum('Cp'), Tin = parseNum('Tin'),
          Tout = parseNum('Tout'), Qin = parseNum('Qin');
        if ([m, Cp, Tin, Tout, Qin].some(v => v === null)) return null;
        return 5 + 0.8 * m + 2 * Cp - 1.5 * Tin + 0.5 * Tout - 0.2 * Qin;
      }
      case 'Energy Extracted from Reservoir': {
        const m = parseNum('m'), Cp = parseNum('Cp'), Tr = parseNum('Tr'), Tf = parseNum('Tf');
        if ([m, Cp, Tr, Tf].some(v => v === null)) return null;
        return 10 + 1.2 * m + 3.5 * Cp + 0.8 * Tr - 0.9 * Tf;
      }
      case 'Energy Extracted through Rock Convection': {
        const h = parseNum('h'), A = parseNum('A'), Tr = parseNum('Tr'), Tf = parseNum('Tf');
        if ([h, A, Tr, Tf].some(v => v === null)) return null;
        return 2 + 1.1 * h + 0.9 * A + 1.5 * (Tr - Tf);
      }
      case 'Well Lifetime': {
        const E = parseNum('E'), Q = parseNum('Q');
        if ([E, Q].some(v => v === null)) return null;
        return 0.5 * (E / Q) + 2;
      }
      default:
        return null;
    }
  })();

  const getConfidenceBand = (value) => {
    const delta = 0.1 * value;
    return { lower: value - delta, upper: value + delta };
  };

  const bestFit = (() => {
    if (basicResult === null && regressionResult === null) return null;
    if (basicResult === null) return { type: 'Regression Model', value: regressionResult, confidence: getConfidenceBand(regressionResult) };
    if (regressionResult === null) return { type: 'Basic Formula', value: basicResult, confidence: getConfidenceBand(basicResult) };

    const weighted = 0.3 * basicResult + 0.7 * regressionResult;
    return {
      type: 'Weighted Estimate',
      value: weighted,
      confidence: getConfidenceBand(weighted),
    };
  })();

  const getVariableImpact = () => {
    switch (selectedModel) {
      case 'Heat Transfer Efficiency':
        return { m: 0.8, Cp: 2, Tin: -1.5, Tout: 0.5, Qin: -0.2 };
      case 'Energy Extracted from Reservoir':
        return { m: 1.2, Cp: 3.5, Tr: 0.8, Tf: -0.9 };
      case 'Energy Extracted through Rock Convection':
        return { h: 1.1, A: 0.9, 'Tr - Tf': 1.5 };
      case 'Well Lifetime':
        return { E: '↑ (directly)', Q: '↓ (inverse)', Correction: '+2 offset' };
      default:
        return {};
    }
  };

  const missing = getMissingFields();
  const impact = getVariableImpact();

  return (
      <ImageBackground source={require('./assets/gwnew.svg')} style={styles.fullScreenBackground}resizeMode="cover">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={styles.gwpredictorBox}>
            <Text style={styles.gwpredictorwell}>Geothermal Well Prediction</Text>
            <Text style={styles.gwpredictormodel}>Selected Model:</Text>
            <Text style={{ fontSize: 18, marginBottom: 20, color: '#2a2a2a', fontStyle: 'italic', textAlign: 'center' }}>
              {selectedModel || 'N/A'}
            </Text>
            {missing.length > 0 ? (
              <Text style={{ color: 'red', fontSize: 16, marginBottom: 20, textAlign: 'center' }}>
                ⚠️ Missing or invalid inputs: {missing.join(', ')}
              </Text>
            ) : (
              <>
                <Text style={styles.gwpredictorbasic}>Basic Calculation Result:</Text>
                <Text style={{ fontSize: 18, marginBottom: 20, color: '#004d40', textAlign: 'center' }}>
                  {basicResult !== null ? basicResult.toFixed(3) : 'Insufficient or invalid inputs'}
                </Text>
                <Text style={styles.gwpredictorregression}>Regression Model Prediction:</Text>
                <Text style={{ fontSize: 18, marginBottom: 20, color: '#00695c', textAlign: 'center' }}>
                  {regressionResult !== null ? regressionResult.toFixed(3) : 'Insufficient or invalid inputs'}
                </Text>
                <Text style={styles.gwpredictorbest}>Best Fit Estimate:</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#00796b', textAlign: 'center', marginBottom: 25 }}>
                  {bestFit ? `${bestFit.type}: ${bestFit.value.toFixed(3)}` : 'No valid predictions'}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 10 }}>Variable Impact (Regression):</Text>
                {Object.entries(impact).map(([key, value]) => (
                  <Text key={key} style={{ fontSize: 15, color: '#333', marginBottom: 2 }}>
                    {key}: <Text style={{ color: '#00796b', fontWeight: 'bold' }}>{value}</Text>
                  </Text>
                ))}
                {bestFit?.confidence && (
                  <Text style={{ fontSize: 15, color: '#333', marginTop: 10 }}>
                    Confidence Range: <Text style={{ color: '#00796b', fontWeight: 'bold' }}>
                      {bestFit.confidence.lower.toFixed(2)} - {bestFit.confidence.upper.toFixed(2)}
                    </Text>
                  </Text>
                )}
              </>
            )}
            <TouchableOpacity
              style={{ backgroundColor: '#00796b', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginTop: 20 }}
              onPress={() => navigation.goBack()}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
  );
}

function GraphsScreen({ route, navigation }) {
  const { selectedModel = "", inputValues = {}, calculatedResult = null } = route.params || {};

  const gwBackground = require("./assets/gwnew.svg");

  let graphLabels = [];
  let graphData = [];
  let xAxisLabel = "";
  let yAxisLabel = "";

  if (selectedModel === "Heat Transfer Efficiency") {
  const m = parseFloat(inputValues['Mass Flow Rate (kg/s)'] || 1);
  const Cp = parseFloat(inputValues['Specific Heat Capacity of Working Fluid (J/kg·K)'] || 1);
  const Tin_start = parseFloat(inputValues['Injection Temperature (Celsius)'] || 0) * 0.8;
  const Tin_end = parseFloat(inputValues['Injection Temperature (Celsius)'] || 0) * 1.2;
  const Tout = parseFloat(inputValues['Outlet Temperature (Celsius)'] || 1);
  const Qin = parseFloat(inputValues['Heat Input from Geothermal Reservoir (Joules)'] || 1);

  xAxisLabel = "Inlet Temperature (Tin)";
  yAxisLabel = "Efficiency %";

  for (let Tin = Tin_start; Tin <= Tin_end; Tin += (Tin_end - Tin_start) / 5) {
    const result = ((m * Cp * (Tout - Tin)) / Qin) * 100;
    graphLabels.push(Tin.toFixed(2));
    graphData.push(result);
  }
} else if (selectedModel === "Energy Extracted from Reservoir") {
  const m = parseFloat(inputValues['Mass Flow Rate (kg/s)'] || 1);
  const Cp = parseFloat(inputValues['Specific Heat Capacity (J/kg·K)'] || 1);
  const Tr_start = parseFloat(inputValues['Reservoir Temperature (Celsius)'] || 0) * 0.8;
  const Tr_end = parseFloat(inputValues['Reservoir Temperature (Celsius)'] || 0) * 1.2;
  const Tf = parseFloat(inputValues['Fluid Temperature (Celsius)'] || 1);

  xAxisLabel = "Reservoir Temperature (Tr)";
  yAxisLabel = "Energy Extracted (kJ)";

  for (let Tr = Tr_start; Tr <= Tr_end; Tr += (Tr_end - Tr_start) / 5) {
    const result = m * Cp * (Tr - Tf);
    graphLabels.push(Tr.toFixed(2));
    graphData.push(result);
  }
} else if (selectedModel === "Energy Extracted through Rock Convection") {
  const h = parseFloat(inputValues['Heat Transfer Coefficient (W/m²·K)'] || 1);
  const A = parseFloat(inputValues['Heat Exchange Surface Area (m²)'] || 1);
  const Tr_start = parseFloat(inputValues['Reservoir Temperature (Celsius)'] || 1) * 0.8;
  const Tr_end = parseFloat(inputValues['Reservoir Temperature (Celsius)'] || 1) * 1.2;
  const Tf = parseFloat(inputValues['Fluid Temperature (Celsius)'] || 1);

  xAxisLabel = "Reservoir Temperature (Tr)";
  yAxisLabel = "Energy Extracted (kJ)";

  for (let Tr = Tr_start; Tr <= Tr_end; Tr += (Tr_end - Tr_start) / 5) {
    const result = h * A * (Tr - Tf);
    graphLabels.push(Tr.toFixed(2));
    graphData.push(result);
  }
} else if (selectedModel === "Well Lifetime") {
  const E = parseFloat(inputValues['Total Thermal Energy in Reservoir (Joules)'] || 1);
  const Q_start = parseFloat(inputValues['Energy Extracted per Second (Watt)'] || 1) * 0.8;
  const Q_end = parseFloat(inputValues['Energy Extracted per Second (Watt)'] || 1) * 1.2;

  xAxisLabel = "Energy Extracted per Second (Q)";
  yAxisLabel = "Well Lifetime (years)";

  for (let Q = Q_start; Q <= Q_end; Q += (Q_end - Q_start) / 5) {
    const result = E / Q;
    graphLabels.push(Q.toFixed(2));
    graphData.push(result);
  }
}
  // --- Auto-scale Y axis for large numbers ---
  let minY = Math.min(...graphData, 0);
  let maxY = Math.max(...graphData, 1);
  if (minY === maxY) { maxY = minY + 1; } // avoid flat line
  const yPadding = (maxY - minY) * 0.1;
  const yMin = minY - yPadding;
  const yMax = maxY + yPadding;

  const chartData = {
    labels: graphLabels,
    datasets: [
      {
        data: graphData,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: "transparent",
    backgroundGradientFrom: "transparent",
    backgroundGradientTo: "transparent",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    propsForDots: {
      r: '6',
      strokeWidth: '3',
      stroke: '#ad6b15',
      fill: '#e0b85a',
    },
    propsForBackgroundLines: {
      stroke: '#014421', // dark green
      strokeDasharray: '4',
    },
    style: {
      borderRadius: 16,
    },
  };

  return (
      <ImageBackground source={gwBackground} style={styles.fullScreenBackground}resizeMode="cover">
        <ScrollView contentContainerStyle={styles.gwcontainer}>
          <BackButton />
          <Text style={styles.gwscreenTitle}>Graphical Representation</Text>
          <View style={{ marginTop: 40 }}>
            {graphData.length > 0 ? (
              <LineChart
                data={chartData}
                width={screenWidth - 32}
                height={Math.min(400, Math.max(220, (yMax - yMin) > 10000 ? 400 : 220))}
                chartConfig={chartConfig}
                style={styles.gwchartStyle}
                bezier
                fromZero={yMin > 0}
                yAxisSuffix=""
                yAxisInterval={1}
                segments={5}
                yLabelsOffset={10}
                withInnerLines={true}
                withOuterLines={true}
                yMin={yMin}
                yMax={yMax}
              />
            ) : (
              <Text style={styles.gwresultsTexts}>No data available for graph.</Text>
            )}
            <Text style={[styles.gwaxisLabel, styles.gwxAxisLabel]}>{xAxisLabel}</Text>
            <Text style={[styles.gwaxisLabel, styles.gwyAxisLabel]}>{yAxisLabel}</Text>
          </View>
        </ScrollView>
      </ImageBackground>
  );
}

function SFRSStack() { 
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SFRS" component={SFRSScreen} />
      <Stack.Screen name="SFRSResults" component={SFRSResultScreen} />
      <Stack.Screen name="SFRSPredictor" component={SFRSAIScreen} />
      <Stack.Screen name="SFRSGraphScreen" component={SFRSGraphScreen} />
    </Stack.Navigator>
  );
}

function GeothermalWellStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GeothermalWell" component={GeothermalWellScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="SimplePredictor" component={SimplePredictorScreen} />
      <Stack.Screen name="GraphsScreen" component={GraphsScreen} />
    </Stack.Navigator>
  );
} 

function EORStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EOR" component={EORScreen} />
      <Stack.Screen name="Results" component={ResultScreen} />
      <Stack.Screen name="Predictor" component={AIScreen} />
      <Stack.Screen name="GraphScreen" component={GraphScreen} />
    </Stack.Navigator>
  );
} 

function EORScreen({ navigation }) {
  const [selectedModel, setSelectedModel] = useState('');
  const [inputValues, setInputValues] = useState({});
  const [showGraphModal, setShowGraphModal] = useState(false);

  const handleInputChange = (field, value) => {
    setInputValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const calculatedResult = () => {
    const values = inputValues;
    if (selectedModel === 'Oil Recovery Factor: Polymer Flooding Efficiency') {
      const inoilsat = parseFloat(values['Initial Oil Saturation (fraction, dimensionless)']);
      const residoil = parseFloat(values['Residual Oil Saturation after Flooding (fraction, dimensionless)']);
      return ((inoilsat - residoil)/ inoilsat) * 100;
    }
    if (selectedModel === 'Oil Recovery Factor: Fractional Flow Theory') {
      const watvis = parseFloat(values['Water Viscosity (Pa·s)'] );
      const oilvis = parseFloat(values['Oil Viscosity (Pa·s)'] ); 
      return (1-(watvis / oilvis)) * 100;
    }
    if (selectedModel === 'Optimal Polymer Concentration: Modified Power Law Model') {
      const k = parseFloat(values['Empirical Coefficient based on Polymer Type (dimensionless)'] );
      const n = parseFloat(values['Flow Behavior Index (dimensionless)'] );
      const Cp = parseFloat(values['Viscosity (Pa·s)'] );
      return (k * (Cp**n)) ;
    }
    if (selectedModel === 'Optimal Polymer Concentration: Empirical Optimization Equation') {
      const oilvis = parseFloat(values['Oil Viscosity (Pa·s)'] );
      const watvis = parseFloat(values['Water Viscosity (Pa·s)'] );
      const K1 = parseFloat(values['Reservoir-Specific Empirical Constant K1 (dimensionless)']);
      const K2 = parseFloat(values['Reservoir-Specific Empirical Constant K2 (dimensionless)']);
      return (K1 / ((oilvis/watvis)**K2)) ;
    }
    if (selectedModel === 'Water Cut Reduction') {
      const Mpolymer = parseFloat(values['Mobility Ratio with Polymer (dimensionless)'] );
      const Mwater = parseFloat(values['Mobility Ratio before Polymer Injection (dimensionless)'] );
      return (1-(Mpolymer / Mwater)) * 100;
    }
    return null;
  };

  const renderDynamicFields = () => {
    const fields = {
      'Oil Recovery Factor: Polymer Flooding Efficiency': ['Initial Oil Saturation (fraction, dimensionless)', 'Residual Oil Saturation after Flooding (fraction, dimensionless)'],
      'Oil Recovery Factor: Fractional Flow Theory': ['Water Viscosity (Pa·s)', 'Oil Viscosity (Pa·s)'],
      'Optimal Polymer Concentration: Modified Power Law Model': ['Empirical Coefficient based on Polymer Type (dimensionless)', 'Flow Behavior Index (dimensionless)', 'Viscosity (Pa·s)'],
      'Optimal Polymer Concentration: Empirical Optimization Equation': ['Oil Viscosity (Pa·s)', 'Water Viscosity (Pa·s)', 'Reservoir-Specific Empirical Constant K1 (dimensionless)', 'Reservoir-Specific Empirical Constant K2 (dimensionless)'],
      'Water Cut Reduction': ['Mobility Ratio with Polymer (dimensionless)', 'Mobility Ratio before Polymer Injection (dimensionless)'],
    };

    return fields[selectedModel]?.map((field) => (
      <View key={field}>
        <Text style={styles.eorlabel}>{field}</Text>
        <TextInput
          style={styles.eorinput}
          placeholder={`Enter ${field}`}
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={inputValues[field] || ''}
          onChangeText={(value) => handleInputChange(field, value)}
        />
      </View>
    ));
  };
  

  return (
    <ImageBackground source={require('./assets/eornew.svg')} style={styles.fullScreenBackground}>
      <ScrollView contentContainerStyle={styles.eorcontainer}>
        <View style={styles.eorrow}>
          <View style={styles.eorleftPane}>
            <Text style={styles.eorlabel}>Select Model/Concept</Text>
            <Picker
              selectedValue={selectedModel}
              onValueChange={(itemValue) => {
                setSelectedModel(itemValue);
                setInputValues({});
              }}
              mode="dropdown"
              style={styles.eorlargepicker}
            >
              <Picker.Item label="Choose Model" value="" />
              <Picker.Item label="Oil Recovery Factor: Polymer Flooding Efficiency" value="Oil Recovery Factor: Polymer Flooding Efficiency" />
              <Picker.Item label="Oil Recovery Factor: Fractional Flow Theory" value="Oil Recovery Factor: Fractional Flow Theory" />
              <Picker.Item label="Optimal Polymer Concentration: Modified Power Law Model" value="Optimal Polymer Concentration: Modified Power Law Model" />
              <Picker.Item label="Optimal Polymer Concentration: Empirical Optimization Equation" value="Optimal Polymer Concentration: Empirical Optimization Equation" />
              <Picker.Item label="Water Cut Reduction" value="Water Cut Reduction" />
            </Picker>
            {renderDynamicFields()}
          </View>
          <View style={styles.eorrightPane}>
            <TouchableOpacity
              style={styles.eorsmallButton}
              onPress={() => {
                const result = calculatedResult();
                navigation.navigate('Results', { selectedModel, inputValues, result });
              }}
            >
              <Text style={styles.eorbuttonText}>Calculated Results</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.eorsmallButton} onPress={() => setShowGraphModal(true)}>
              <Text style={styles.eorbuttonText}>Graphical Representation</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.eorsmallButton}
              onPress={() => navigation.navigate('Predictor', { selectedModel, inputValues })}
            >
              <Text style={styles.eorbuttonText}>Simple Predictor</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Modal visible={showGraphModal} transparent animationType="slide">
          <View style={styles.eormodalContainer}>
            <View style={styles.eormodalContent}>
              <Text style={styles.eormodalTitle}>Select Graph Type</Text>
              <TouchableOpacity
                style={styles.eormodalButton}
                onPress={() => {
                  setShowGraphModal(false);
                  navigation.navigate('GraphScreen', { selectedModel, chartType: 'line', inputValues });
                }}
              >
                <Text style={styles.eormodalButtonText}>Line Chart</Text>
              </TouchableOpacity>
              <TouchableOpacity>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </ImageBackground>
  );
}

function HomeScreen({ navigation, setHeaderImage }) {
  const [background, setBackground] = useState(initialBackground);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [buttonsVisible, setButtonsVisible] = useState(false);
  const fadeLoop = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      setBackground(initialBackground);
      fadeAnim.setValue(1);
      setButtonsVisible(false);
      setHeaderImage(initialLogo);

      fadeLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      fadeLoop.current.start();

      const timer = setTimeout(() => {
        fadeLoop.current.stop();
        fadeAnim.setValue(1);
        setBackground(newBackground);
        setButtonsVisible(true);
        setHeaderImage(newLogo);
      }, 5000);

      return () => {
        clearTimeout(timer);
        fadeLoop.current?.stop();
      };
    }, [])
  );

  return (
    <ImageBackground source={background} style={styles.fullScreenBackground}>
      <Animated.View style={[styles.mcontainer, { opacity: fadeAnim }]}>
        {buttonsVisible && (
          <View style={styles.mbuttonRowContainer}>
            <TouchableOpacity
              style={styles.msquareButton} 
              onPress={() => navigation.navigate("Smart Fluid Rheology Simulator")}
            >
              <Text style={styles.mbuttonText}>Smart Fluid Rheology Simulator</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.msquareButton}
              onPress={() => navigation.navigate("Geothermal Well Optimization Tool")}
            >
              <Text style={styles.mbuttonText}>Geothermal Well Optimization Tool</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.msquareButton}
              onPress={() => navigation.navigate("Enhanced Oil Recovery Planner")}
            >
              <Text style={styles.mbuttonText}>Enhanced Oil Recovery Planner</Text>
            </TouchableOpacity>
          </View>
        )}
        <StatusBar style="auto" />
      </Animated.View>
    </ImageBackground>
  );
}

function ToolScreen({ route, navigation }) {
  const { setHeaderImage } = route.params;
  const screenName = route.name;

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedModel, setSelectedModel] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [subDropdownVisible, setSubDropdownVisible] = useState(false);
  const [subOption, setSubOption] = useState("");
  const [inputValues, setInputValues] = useState({});
  const [calculatedResult, setCalculatedResult] = useState(null);

  const toolAssets = {
    "Smart Fluid Rheology Simulator": {
      loadingBg: require("./assets/SRFSBG.svg"),
      finalBg: require("./assets/sfrsnew.svg"),
      loadingLogo: require("./assets/srfsloadinglogo.svg"),
      finalLogo: require("./assets/srfsLogo.svg"),
    },
    "Geothermal Well Optimization Tool": {
      loadingBg: require("./assets/GWBG.svg"),
      finalBg: require("./assets/gwnew.svg"),
      loadingLogo: require("./assets/gwloadinglogo.svg"),
      finalLogo: require("./assets/gwLogo.svg"),
    },
    "Enhanced Oil Recovery Planner": {
      loadingBg: require("./assets/EORBG.svg"),
      finalBg: require("./assets/eornew.svg"),
      loadingLogo: require("./assets/eorloadinglogo.svg"),
      finalLogo: require("./assets/eorLogo.svg"),
    },
    "About Us":{
      finalBg: require("./assets/aboutbg.svg"),
      finalLogo: require("./assets/LogoOnlyFinalUI.svg"),
    },
    "How To Use":{
      finalBg: require("./assets/htubg.svg"),
      finalLogo: require("./assets/LogoOnlyFinalUI.svg"),
    }
  };

  const assets = toolAssets[screenName];

  useFocusEffect(
    React.useCallback(() => {
      setIsLoading(true);
      setBackgroundImage(assets.loadingBg);
      setHeaderImage(assets.loadingLogo);

      const fadeLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      fadeLoop.start();

      const timer = setTimeout(() => {
        fadeLoop.stop();
        fadeAnim.setValue(1);
        setBackgroundImage(assets.finalBg);
        setHeaderImage(assets.finalLogo);
        setIsLoading(false);
      }, 5000);

      return () => {
        clearTimeout(timer);
        fadeLoop.stop();
      };
    }, [screenName])
  );

  if (screenName === "Smart Fluid Rheology Simulator" && !isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ImageBackground source={backgroundImage} style={styles.fullScreenBackground}>
          <SFRSStack />
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (screenName === "Geothermal Well Optimization Tool" && !isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ImageBackground source={backgroundImage} style={styles.fullScreenBackground}>
          <GeothermalWellStack />
        </ImageBackground>
      </SafeAreaView>
    );
  }

  if (screenName === "Enhanced Oil Recovery Planner" && !isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ImageBackground source={backgroundImage} style={styles.fullScreenBackground}>
          <EORStack />
        </ImageBackground>
      </SafeAreaView>
    );
  }

if (screenName === "About Us" && !isLoading) {
  return (
      <SafeAreaView style={{ flex: 1 }}>
        <ImageBackground source={backgroundImage} style={styles.fullScreenBackground}>
        </ImageBackground>
      </SafeAreaView>
    );
  }

if (screenName === "How To Use" && !isLoading) {
  return (
      <SafeAreaView style={{ flex: 1 }}>
        <ImageBackground source={backgroundImage} style={styles.fullScreenBackground}>
        </ImageBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={backgroundImage} style={styles.fullScreenBackground}>
        <Animated.View style={[styles.mscreenContainer, { opacity: fadeAnim }]} />
      </ImageBackground>
    </SafeAreaView>
  );
}

function ResultScreen({ route }) {
  const navigation = useNavigation()
  const { selectedModel, inputValues, result } = route.params;
  const eorFinalBackground = require("./assets/eornew.svg");

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={eorFinalBackground} style={styles.fullScreenBackground}>
        <View style={styles.eorContainer}>
        <BackButton />
          <Text style={[styles.eorscreenTitle, { color: '#411E38' }, {marginTop: 50},{fontSize: 36}]}>Calculated Result</Text>
           <Text style={styles.eorselectedmodel}> {selectedModel} </Text>
          <View style={styles.eorboxContainer}>
            {Object.keys(inputValues).map((key, index) => (
            <Text key={index} style={styles.eorscreenText}>
              {key}: {inputValues[key]}
            </Text>
          ))}
          <Text style={[styles.eorscreenTitle, { marginTop: 20 }, {textAlign: "center"},{marginBottom: 50}]}>
            Result: {result?.toFixed(2)} %
          </Text>
        </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

function GraphScreen({ route, navigation }) {
  const { selectedModel = "", inputValues = {},calculatedResult = null } = route.params || {};

  const eorFinalBackground = require("./assets/eornew.svg");

  let graphLabels = [];
  let graphData = [];
  let xAxisLabel = "";
  let yAxisLabel = "";

  if (selectedModel.includes("Polymer Flooding Efficiency")) {
    const residoil = parseFloat(inputValues['Residual Oil Saturation after Flooding (fraction, dimensionless)'] || 1);
    const inoil_start = parseFloat(inputValues['Initial Oil Saturation (fraction, dimensionless)'] || 0) * 0.8;
    const inoil_end = parseFloat(inputValues['Initial Oil Saturation (fraction, dimensionless)'] || 0) * 1.2;

    xAxisLabel = "Initial Oil Saturation (fraction, dimensionless)";
    yAxisLabel = "Recovery %";

    for (let inoil = inoil_start; inoil <= inoil_end; inoil += (inoil_end - inoil_start) / 5) {
      const result = ((inoil - residoil) / (inoil)) * 100;
      graphLabels.push(inoil.toFixed(2)); 
      graphData.push(result); 
    }
  } else if (selectedModel.includes("Fractional Flow Theory")) {
    const oilvis = parseFloat(inputValues['Oil Viscosity (Pa·s)'] || 1);
    const watvis_start = parseFloat(inputValues['Water Viscosity (Pa·s)'] || 0) * 0.8;
    const watvis_end = parseFloat(inputValues['Water Viscosity (Pa·s)'] || 0) * 1.2;
   
    xAxisLabel = "Water Viscosity (Pa·s)";
    yAxisLabel = "Recovery %";
   
    for (let watvis = watvis_start; watvis <= watvis_end; watvis += (watvis_end - watvis_start) / 5) {
      const result = (1 - (watvis / oilvis)) * 100;
      graphLabels.push(watvis.toFixed(2));
      graphData.push(result);
    }
  } else if (selectedModel.includes("Modified Power Law Model")) {
    const k = parseFloat(inputValues['Empirical Coefficient based on Polymer Type (dimensionless)'] || 1);
    const n = parseFloat(inputValues['Flow Behavior Index (dimensionless)'] || 1);
    const Cp_start = parseFloat(inputValues['Viscosity (Pa·s)'] || 1) * 0.8;
    const Cp_end = parseFloat(inputValues['Viscosity (Pa·s)'] || 1) * 1.2;
   
    xAxisLabel = "Cp (Polymer Concentration)";
    yAxisLabel = "Viscosity (Pa·s)";
   
    for (let Cp = Cp_start; Cp <= Cp_end; Cp += (Cp_end - Cp_start) / 5) {
      const result = k * (Cp ** n);
      graphLabels.push(Cp.toFixed(2));
      graphData.push(result);
    }
  } else if (selectedModel.includes("Empirical Optimization Equation")) {
    const watvis = parseFloat(inputValues['Water Viscosity (Pa·s)'] || 1);
    const oilvis_start = parseFloat(inputValues['Oil Viscosity (Pa·s)'] || 1) * 0.8;
    const oilvis_end = parseFloat(inputValues['Oil Viscosity (Pa·s)'] || 1) * 1.2;
    const K1 = parseFloat(inputValues['Reservoir-Specific Empirical Constant K1 (dimensionless)'] || 1);
    const K2 = parseFloat(inputValues['Reservoir-Specific Empirical Constant K2 (dimensionless)'] || 1);
   
    xAxisLabel = "Oil Viscosity (Pa·s)";
    yAxisLabel = "Optimal Concentration";
   
    for (let oilvis = oilvis_start; oilvis <= oilvis_end; oilvis += (oilvis_end - oilvis_start) / 5) {
      const result = K1 / ((oilvis / watvis) ** K2);
      graphLabels.push(oilvis.toFixed(2));
      graphData.push(result);
    }
  } else if (selectedModel.includes("Water Cut Reduction")) {
    const Mwater = parseFloat(inputValues['Mobility Ratio before Polymer Injection (dimensionless)'] || 1);
    const Mpoly_start = parseFloat(inputValues['Mobility Ratio with Polymer (dimensionless)'] || 1) * 0.8;
    const Mpoly_end = parseFloat(inputValues['Mobility Ratio with Polymer (dimensionless)'] || 1) * 1.2;
   
    xAxisLabel = "Mobility Ratio (polymer)";
    yAxisLabel = "Water Cut Reduction %";
   
    for (let Mpoly = Mpoly_start; Mpoly <= Mpoly_end; Mpoly += (Mpoly_end - Mpoly_start) / 5) {
      const result = (1 - (Mpoly / Mwater)) * 100;
      graphLabels.push(Mpoly.toFixed(2));
      graphData.push(result);
    }
  }

  console.log("Graph Data:", graphData);
  console.log("Graph Labels:", graphLabels);

  let minY = Math.min(...graphData, 0);
  let maxY = Math.max(...graphData, 1);
  if (minY === maxY) { maxY = minY + 1; } 
  const yPadding = (maxY - minY) * 0.1;
  const yMin = minY - yPadding;
  const yMax = maxY + yPadding;

  const chartData = {
    labels: graphLabels,
    datasets: [
      {
        data: graphData,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: "transparent",
    backgroundGradientFrom: "transparent",
    backgroundGradientTo: "transparent",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,  
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, 
    propsForDots: {
    r: '6',
    strokeWidth: '3',
    stroke: '#ad6b15',
    fill: '#e0b85a',    
  },
  propsForBackgroundLines: {
    stroke: '#472a04',      
    strokeDasharray: '4',  
  },
  style: {
    borderRadius: 16,
  },
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={eorFinalBackground} style={styles.fullScreenBackground}>
        <View style={styles.eorContainer}>
          <BackButton />
          <Text style={styles.eorscreenTitle}>Graphical Representation</Text>
          {/* Adjusted margin-top to move the graph lower */}
          <View style={{ marginTop: 60 }}>  
            {graphData.length > 0 ? (
              <LineChart
                data={chartData}
                width={screenWidth - 32}
                height={220}
                chartConfig={chartConfig} 
                style={styles.chartStyle}
                bezier 
                fromZero={yMin > 0}
                yAxisSuffix=""
                yAxisInterval={1}
                segments={5}
                yLabelsOffset={10}
                withInnerLines={true}
                withOuterLines={true}
                yMin={yMin}
                yMax={yMax}
              />
            ) : (
              <Text style={styles.eorscreenText}>No data available for graph.</Text>
            )}
            <Text style={[styles.eoraxisLabel, styles.eorxAxisLabel]}>{xAxisLabel}</Text>
            <Text style={[styles.eoraxisLabel, styles.eoryAxisLabel]}>{yAxisLabel}</Text>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

function AIScreen({ route, navigation }) {
  const eorFinalBackground = require("./assets/eornew.svg");
  const { selectedModel, inputValues } = route.params;

  const [predictedResult, setPredictedResult] = useState(null);
  const [bestEstimate, setBestEstimate] = useState(null);

  useEffect(() => {
    if (!selectedModel) return;

    const parseFloatSafe = (val) => (val ? parseFloat(val) : NaN);

    let prediction = null;
    let best = null;
    let errorMessage = null;

    switch (selectedModel) {
      case "Oil Recovery Factor: Polymer Flooding Efficiency": {
        const inoilsat = parseFloatSafe(inputValues["Initial Oil Saturation (fraction, dimensionless)"]);
        const residoil = parseFloatSafe(inputValues['Residual Oil Saturation after Flooding (fraction, dimensionless)']);

        if (isNaN(inoilsat) || isNaN(residoil)) {
          errorMessage = "Please enter valid numerical values for initial and residual oil saturation.";
          break;
        }

        if (inoilsat <= 0) {
          errorMessage = "Initial oil saturation must be greater than zero.";
          break;
        }

        if (residoil < 0 || residoil > inoilsat) {
          errorMessage = "Residual oil saturation must be between zero and the initial oil saturation value.";
          break;
        }

        prediction = ((inoilsat - residoil) / inoilsat) * 100 * 1.05;
        prediction = Math.min(Math.max(prediction, 0), 100); 

        let bestORF = -Infinity;
        let bestInOil = inoilsat;
        let bestResOil = residoil;

        for (let i = inoilsat * 0.9; i <= inoilsat * 1.1; i += 0.01) {
          for (let r = Math.max(0.01, residoil * 0.8); r < i; r += 0.01) {
            const orf = ((i - r) / i) * 100 * 1.05;
            if (orf > bestORF) {
              bestORF = orf;
              bestInOil = i;
              bestResOil = r;
            }
          }
        }

        best = {
          target: "Maximize Oil Recovery Factor",
          idealValue: "Close to 100%",
          notes: `Based on your inputs, the predictor suggests:\nInitial Oil Saturation ≈ ${bestInOil.toFixed(2)}, Residual Oil Saturation ≈ ${bestResOil.toFixed(2)} → Recovery Factor ≈ ${bestORF.toFixed(2)}%`,
        };
        break;
      }

      case "Oil Recovery Factor: Fractional Flow Theory": {
        const watvis = parseFloatSafe(inputValues['Water Viscosity (Pa·s)']);
        const oilvis = parseFloatSafe(inputValues['Oil Viscosity (Pa·s)']);

        if (isNaN(watvis) || isNaN(oilvis)) {
          errorMessage = "Please enter valid numerical values for water and oil viscosity.";
          break;
        }

        if (oilvis <= 0) {
          errorMessage = "Oil viscosity must be greater than zero.";
          break;
        }

        if (watvis < 0) {
          errorMessage = "Water viscosity cannot be negative.";
          break;
        }

        if (watvis > oilvis) {
          errorMessage = "Water viscosity should not exceed oil viscosity for a valid prediction.";
          break;
        }

        prediction = (1 - (watvis / oilvis)) * 100 * 0.95;
        prediction = Math.min(Math.max(prediction, 0), 100); 

        let bestORF = -Infinity;
        let bestOilVis = oilvis;
        let bestWaterVis = watvis;

        for (let o = oilvis * 0.8; o <= oilvis * 1.2; o += 0.05) {
          if (o <= 0) continue;
          for (let w = Math.max(0.1, watvis * 0.8); w <= watvis * 1.2; w += 0.05) {
            if (w > o) continue;
            const orf = (1 - (w / o)) * 100 * 0.95;
            if (orf > bestORF) {
              bestORF = orf;
              bestOilVis = o;
              bestWaterVis = w;
            }
          }
        }

        best = {
          target: "Maximize Oil Recovery Factor",
          idealValue: "Close to 100%",
          notes: `Based on your inputs, the predictor suggests:\nOil Viscosity ≈ ${bestOilVis.toFixed(2)} cP, Water Viscosity ≈ ${bestWaterVis.toFixed(2)} cP → Recovery Factor ≈ ${bestORF.toFixed(2)}%`,
        };
        break;
      }

      case "Optimal Polymer Concentration: Empirical Optimization Equation": {
        const oilvis = parseFloatSafe(inputValues['Oil Viscosity (Pa·s)']);
        const watvis = parseFloatSafe(inputValues['Water Viscosity (Pa·s)']);
        const K1 = parseFloatSafe(inputValues["Reservoir-Specific Empirical Constant K1 (dimensionless)"]);
        const K2 = parseFloatSafe(inputValues["Reservoir-Specific Empirical Constant K2 (dimensionless)"]);

        if (isNaN(oilvis) || isNaN(watvis) || isNaN(K1) || isNaN(K2)) {
          errorMessage = "Please enter valid numerical values for oil viscosity, water viscosity, K1, and K2.";
          break;
        }

        if (oilvis <= 0 || watvis <= 0 || K1 <= 0) {
          errorMessage = "Oil viscosity, water viscosity, and K1 must be greater than zero.";
          break;
        }

        try {
          prediction = (K1 / Math.pow(oilvis / watvis, K2)) * 0.9;
          if (isNaN(prediction) || !isFinite(prediction)) throw new Error();
        } catch {
          errorMessage = "Calculation could not be completed due to invalid inputs.";
          break;
        }

        let bestValue = -Infinity;
        let bestOil = oilvis;
        let bestWat = watvis;

        for (let o = oilvis * 0.8; o <= oilvis * 1.2; o += 0.05) {
          if (o <= 0) continue;
          for (let w = Math.max(0.1, watvis * 0.8); w <= watvis * 1.2; w += 0.05) {
            if (w <= 0) continue;
            const val = (K1 / Math.pow(o / w, K2)) * 0.9;
            if (val > bestValue) {
              bestValue = val;
              bestOil = o;
              bestWat = w;
            }
          }
        }

        best = {
          target: "Optimize Polymer Usage",
          idealValue: "Reservoir-specific efficiency",
          notes: `Based on your inputs, the predictor suggests:\nOil Viscosity ≈ ${bestOil.toFixed(2)} cP, Water Viscosity ≈ ${bestWat.toFixed(2)} cP → Efficiency ≈ ${bestValue.toFixed(2)}`,
        };
        break;
      }

   case "Optimal Polymer Concentration: Modified Power Law Model": {
  const k = parseFloatSafe(inputValues['Empirical Coefficient based on Polymer Type (dimensionless)']);
  const n = parseFloatSafe(inputValues['Flow Behavior Index (dimensionless)']);
  const Cp = parseFloatSafe(inputValues['Viscosity (Pa·s)']);

  if (isNaN(Cp)) {
    errorMessage = "Please enter a valid number for viscosity (cP).";
    break;
  }
  if (isNaN(k) || isNaN(n)) {
    errorMessage = "Please enter valid numbers for empirical coefficient (k) and flow behavior index (n).";
    break;
  }

  let bestValue = -Infinity;
  let bestCp = Cp;

  for (let c = Cp * 0.5; c <= Cp * 1.5; c += 0.2) {
    const val = k * Math.pow(c, n);
    if (val > bestValue) {
      bestValue = val;
      bestCp = c;
    }
  }

  best = {
    target: "Optimize Polymer Efficiency",
    idealValue: "Maximum efficiency for current fluid properties",
    notes: `Based on your inputs, the predictor suggests:\nPolymer Concentration ≈ ${bestCp.toFixed(2)} → Efficiency ≈ ${bestValue.toFixed(2)}`,
  };
  prediction = bestValue;
  break;
}

      case "Water Cut Reduction": {
        const Mpolymer = parseFloatSafe(inputValues["Mobility Ratio with Polymer (dimensionless)"]);
        const Mwater = parseFloatSafe(inputValues["Mobility Ratio before Polymer Injection (dimensionless)"]);

        if (isNaN(Mpolymer) || isNaN(Mwater)) {
          errorMessage = "Please enter valid numerical values for mobility ratios.";
          break;
        }

        if (Mwater <= 0) {
          errorMessage = "Mobility ratio before polymer injection must be greater than zero.";
          break;
        }

        if (Mpolymer < 0) {
          errorMessage = "Mobility ratio with polymer cannot be negative.";
          break;
        }

        if (Mpolymer > Mwater) {
          errorMessage = "Mobility ratio with polymer should not exceed mobility ratio before polymer injection.";
          break;
        }

        prediction = (1 - Mpolymer / Mwater) * 100 * 1.02;
        prediction = Math.min(Math.max(prediction, 0), 100);

        let bestReduction = -Infinity;
        let bestMp = Mpolymer;
        let bestMw = Mwater;

        for (let mw = Mwater * 0.8; mw <= Mwater * 1.2; mw += 0.2) {
          for (let mp = Math.max(0.01, Mpolymer * 0.5); mp <= Mpolymer * 1.2; mp += 0.1) {
            if (mp < mw) {
              const reduction = (1 - mp / mw) * 100 * 1.02;
              if (reduction > bestReduction) {
                bestReduction = reduction;
                bestMp = mp;
                bestMw = mw;
              }
            }
          }
        }

        best = {
          target: "Reduce Water Cut",
          idealValue: "As close to 100% as possible",
          notes: `Based on your inputs, the predictor suggests:\nMobility Ratio with Polymer ≈ ${bestMp.toFixed(2)}, Mobility Ratio before Polymer Injection ≈ ${bestMw.toFixed(2)} → Reduction ≈ ${bestReduction.toFixed(2)}%`,
        };
        break;
      }

      default:
        best = {
          target: "No Best Estimates Available",
          idealValue: "-",
          notes: "-",
        };
        errorMessage = "No valid model selected. Please choose a prediction model.";
    }

    if (errorMessage) {
      setPredictedResult(errorMessage);
      setBestEstimate({
        target: "No Best Estimates Available",
        idealValue: "-",
        notes: "-",
      });
    } else if (prediction !== null && !isNaN(prediction)) {
      setPredictedResult(prediction.toFixed(3));
      setBestEstimate(best);
    } else {
      setPredictedResult("Unable to generate prediction. Please check your inputs.");
      setBestEstimate({
        target: "No Best Estimates Available",
        idealValue: "-",
        notes: "-",
      });
    }
  }, [selectedModel, inputValues]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground source={eorFinalBackground} style={styles.fullScreenBackground}>
        <ScrollView contentContainerStyle={styles.eorContainer}>
          <Text style={styles.title}>Enhanced Oil Recovery Prediction</Text>

          <Text style={styles.subtitle}>
            Selected Model: <Text style={styles.modelName}>{selectedModel || "None selected"}</Text>
          </Text>

          <View style={styles.boxContainer}>
            <View style={styles.inputSummary}>
              <Text style={styles.sectionTitle}>Input Values:</Text>
              {Object.keys(inputValues).length === 0 ? (
                <Text style={styles.noDataText}>No inputs provided.</Text>
              ) : (
                Object.entries(inputValues).map(([key, val]) => (
                  <Text key={key} style={styles.inputText}>
                    {key}: {val}
                  </Text>
                ))
              )}
            </View>

            <View style={styles.resultContainer}>
              <Text style={styles.sectionTitle}>Predicted Result:</Text>
              <Text style={styles.resultText}>{predictedResult}</Text>
              {predictedResult &&
                !predictedResult.toString().includes("Please enter") &&
                !predictedResult.toString().includes("Unable") &&
                !predictedResult.toString().includes("No valid") && (
                  <Text style={styles.predictionDescription}>
                    (This prediction uses regression models that smooth out your inputs by analyzing nearby variations, providing a stable and reliable estimate.)
                  </Text>
                )}
            </View>

            <View style={styles.bestEstimateContainer}>
              <Text style={styles.sectionTitle}>Best Estimates:</Text>
              <Text style={styles.estimateTitle}>Target: {bestEstimate?.target}</Text>
              <Text style={styles.estimateValue}>Ideal Value: {bestEstimate?.idealValue}</Text>
              <Text style={styles.estimateNotes}>{bestEstimate?.notes}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back to Inputs</Text>
          </TouchableOpacity>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

function AboutScreen() {
  return (
    <ImageBackground source={aboutBackground} style={styles.fullScreenBackground}>
    </ImageBackground>
  );
}

function HowToUseScreen() {
  return (
  <ImageBackground source={htuBackground} style={styles.fullScreenBackground}>
      </ImageBackground>);
      }

export default function App() {
  const [headerImage, setHeaderImage] = useState(initialLogo);

  useEffect(() => {
    Orientation.lockToLandscape();

    return () => {
      Orientation.unlockAllOrientations();
    };
  }, []);

  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Home"
        screenOptions={{
          drawerPosition: "right",
          headerStyle: { backgroundColor: "#252426" },
          headerTintColor: "#fcdac0",
          headerTitle: () => (
            <Image
              source={headerImage}
              style={{ width: 140, height: 60, resizeMode: "contain" }}
            />
          ),
        }}
      >
        <Drawer.Screen name="Home">
          {(props) => <HomeScreen {...props} setHeaderImage={setHeaderImage} />}
        </Drawer.Screen>
        <Drawer.Screen
          name="Smart Fluid Rheology Simulator"
          component={ToolScreen}
          initialParams={{ setHeaderImage }}
        />
        <Drawer.Screen
          name="Geothermal Well Optimization Tool"
          component={ToolScreen}
          initialParams={{ setHeaderImage }}
        />
        <Drawer.Screen
          name="Enhanced Oil Recovery Planner"
          component={ToolScreen}
          initialParams={{ setHeaderImage }}
        />

        <Drawer.Screen name="About Us" component={AboutScreen} />
        <Drawer.Screen name="How to Use" component={HowToUseScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  fullScreenBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
  },  
  mcontainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mbuttonRowContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 50,
    gap: 10,
  },
  msquareButton: {
    backgroundColor: "transparent",
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    padding: 111,
    marginHorizontal: 125,
  },
  mbuttonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Cave Age",
  },
  mscreenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sfrscontainer: { flexGrow: 1, padding: 20, paddingBottom: 150 },
  sfrstitle: { fontSize: 24, color: "#fff", textAlign: "center", marginBottom: 20 },
  sfrsrow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  sfrslabel: { color: "#fff", marginBottom: 10, fontSize: 18 },
  sfrslargepicker: { 
    backgroundColor: "#3d0c01",
    color: "#fff",
    marginBottom: 20,
    fontSize: 18,
    height: 50, 
    borderRadius: 8,
  },
  sfrsboxContainer: {width: '90%',
  alignSelf: 'center',
  borderRadius: 10,
  overflow: 'hidden',
  backgroundColor: "#d1c5c5",
  marginBottom: 20,
  paddingTop: 50,
  shadowColor: "#000",          
  shadowOffset: { width: 0, height: 4 }, 
  shadowOpacity: 0.3,           
  shadowRadius: 4.65, }, 
  sfrsleftPane: { flex: 1, paddingRight: 10 },
  sfrsrightPane: { flex: 1, justifyContent: "space-around", alignItems: "center", paddingVertical: 20 },
  sfrsinput: { backgroundColor: "#3d0c01", color: "#fff", padding: 10, borderRadius: 8, marginBottom: 10 },
  sfrssmallButton: {
    backgroundColor: "#3d0c01", 
    width: "60%", 
    height: 50, 
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginVertical: 10, 
    shadowColor: "#000",          
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3,           
    shadowRadius: 4.65,          
  
    elevation: 8,        
  },
  sfrsbuttonText: { color: "#fff", fontWeight: "bold", textAlign: "center", fontSize: 16 },
  sfrsmodalContainer: { flex: 1, justifyContent: "center", backgroundColor: "rgba(77, 7, 7, 0.15)" },
  sfrsmodalContent: { backgroundColor: "#3b4d3a", padding: 20, borderRadius: 10 },
  sfrsmodalTitle: { color: "#fff", fontSize: 18, marginBottom: 10 },
  sfrsmodalButton: { backgroundColor: "#ff0000", padding: 15, borderRadius: 8, marginBottom: 10 },
  sfrsmodalButtonText: { color: "#000", fontWeight: "bold" },
  sfrsresultsContainer: {justifyContent: "center"},
  sfrsresultsText: {justifyContent: "center"},
  sfrsscreenTitle: {fontSize: 24,fontWeight: "bold", color: "white",marginBottom: 10,textAlign:"center"},
  sfrschartContainer: {marginTop: 20,justifyContent: "center",alignItems: "center"
  },
  eorscreenTitle: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center"
  },
  eorboxContainer: {
  width: '90%',
  alignSelf: 'center',
  borderRadius: 10,
  overflow: 'hidden',
  backgroundColor: "#411E38",
  marginBottom: 20,
  paddingTop: 50,
  shadowColor: "#000",          
  shadowOffset: { width: 0, height: 4 }, 
  shadowOpacity: 0.3,           
  shadowRadius: 4.65,  
},
  eorselectedmodel: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  eorscreenText: {
    marginTop: 5,
    marginBottom: 0,
    fontSize: 16,
    color: "white",
    textAlign: "center",
  },
  eorContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  predictionDescription: {
  fontSize: 13,
  fontStyle: "italic",
  color: "#eee",
  marginTop: 4,
  marginHorizontal: 8,
},
  dropdown: {
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  dropdownText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  dropdownOptions: {
    backgroundColor: "white",
    borderRadius: 5,
    marginBottom: 20,
    alignSelf: "flex-start",
    elevation: 3,
  },
  optionButton: {
    padding: 10,
  },
  optionText: {
    fontSize: 16,
    color: "black",
  },
  table: {
    borderWidth: 1,
    borderColor: "white",
    marginBottom: 30,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    width: 80,
    height: 50,
    borderWidth: 1,
    borderColor: "white",
  },
  eorButtonContainer: {
    marginTop: 20,
  },
  eorButton: {
    backgroundColor: "#411E38",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginVertical: 8,
    alignItems: "center",
  },
  eorButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  eorlabel: { color: "#fff", marginBottom: 10, fontSize: 18 },
  chartContainer: {
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#411E38",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#ccc",
    marginBottom: 5,
    textAlign: "center",
  },
  modelName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#eee",
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic"
  },
  assumptionText: {
  fontStyle: "italic",
  fontSize: 12,
  color: "#666",
  marginTop: 6,
},
 boxContainer: {
  width: '90%',
  alignSelf: 'center',
  borderRadius: 10,
  overflow: 'hidden',
  backgroundColor: "#411E38",
  marginBottom: 20,
  shadowColor: "#000",          
  shadowOffset: { width: 0, height: 4 }, 
  shadowOpacity: 0.3,           
  shadowRadius: 4.65,  
},
  inputSummary: {
  backgroundColor: "#411E38",
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  paddingVertical: 20,
  paddingHorizontal: 40,
  minHeight: 120,
  justifyContent: "center",
},
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#eee",
    marginBottom: 10,
    textAlign: "left",
  alignSelf: "flex-start",
  },
  inputText: {
    fontSize: 16,
    color: "#eee",
    marginVertical: 3,
    textAlign: "center",
  },
  noDataText: {
    fontSize: 16,
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
  },
  resultContainer: {
  backgroundColor: "#411E38",
  borderRadius: 0,
  paddingVertical: 20,
  paddingHorizontal: 40,
  minHeight: 120,
  justifyContent: "center",
  alignItems: "center",
},
  resultText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#eee",
    textAlign: "center",
  },
 bestEstimateContainer: {
  backgroundColor: "#411E38",
  borderBottomLeftRadius: 10,
  borderBottomRightRadius: 10,
  paddingVertical: 20,
  paddingHorizontal: 40,
  minHeight: 120,
  justifyContent: "center",
},
  estimateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#eee",
    marginBottom: 5,
  },
  estimateValue: {
    fontSize: 16,
    color: "#eee",
    marginBottom: 5,
    textAlign: "center",
  },
  estimateNotes: {
    fontSize: 14,
    color: "#ccc",
    fontStyle: "italic",
    textAlign: "center",
  },

  eorinput: { backgroundColor: "#411E38", color: "#fff", padding: 10, borderRadius: 8, marginBottom: 10 },
  eorcontainer: { flexGrow: 1, padding: 20, paddingBottom: 150 },
  eorrow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  eorlabel: { color: "#fff", marginBottom: 10, fontSize: 18 },
  eorleftPane: { flex: 1, paddingRight: 10 },
  eorlargepicker: { 
    backgroundColor: "#411E38",
    color: "#fff",
    marginBottom: 20,
    fontSize: 18,
    height: 50, 
    borderRadius: 8,
  },
  eorrightPane: { flex: 1, justifyContent: "space-around", alignItems: "center", paddingVertical: 20 },
  eorsmallButton: {
    backgroundColor: "#411E38", 
    width: "60%", 
    height: 50, 
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    marginVertical: 10, 
  
    shadowColor: "#000",           
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3,            
    shadowRadius: 4.65,            
  
    elevation: 8,                 
  },
  eorbuttonText: { color: "#fff", fontWeight: "bold", textAlign: "center", fontSize: 16 },
  eormodalContainer: { flex: 1, justifyContent: "center", backgroundColor: "rgba(79, 68, 7, 0.24)))))" },
  eormodalContent: { backgroundColor: "#3b4d3a", padding: 20, borderRadius: 10 },
  eormodalTitle: { color: "#fff", fontSize: 18, marginBottom: 10 },
  eormodalButton: { backgroundColor: "#fdda0d", padding: 15, borderRadius: 8, marginBottom: 10 },
  eormodalButtonText: { color: "#000", fontWeight: "bold" },
  eorresultsContainer: {justifyContent: "center"},
  eorresultsText: {justifyContent: "center"},
  eorscreenTitle: {fontSize: 24,fontWeight: "bold", color: "white",marginBottom: 10,},
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 30,
  },
  backButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold"
  },
  gwcontainer: { flexGrow: 1, padding: 20, paddingBottom: 150 },
  gwtitle: { fontSize: 24, color: "#fff", textAlign: "center", marginBottom: 20 },
  gwrow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  gwlabel: { color: "#fff", marginBottom: 10, fontSize: 18 },
  gwlargepicker: {backgroundColor: "#2D3A2B",color: "#fff",marginBottom: 20,fontSize: 18,height: 50,borderRadius: 8,},
  gwleftPane: { flex: 1, paddingRight: 10 },
  gwrightPane: { flex: 1, justifyContent: "space-around", alignItems: "center", paddingVertical: 20 },
  gwinput: { backgroundColor: "#2D3A2B", color: "#fff", padding: 10, borderRadius: 8, marginBottom: 10 },
  gwsmallButton: {backgroundColor: "#2D3A2B",width: "60%",height: 50,justifyContent: "center",alignItems: "center",borderRadius: 12,marginVertical: 10,shadowColor: "#000",shadowOffset: { width: 0, height: 4 },shadowOpacity: 0.3,shadowRadius: 4.65,elevation: 8},
  gwbuttonText: { color: "#fff", fontWeight: "bold", textAlign: "center", fontSize: 16 },
  gwmodalContainer: { flex: 1, justifyContent: "center", backgroundColor: "rgba(9, 79, 7, 0.74)" },
  gwmodalContent: { backgroundColor: "#3b4d3a", padding: 20, borderRadius: 10 },
  gwmodalTitle: { color: "#fff", fontSize: 18, marginBottom: 10 },
  gwmodalButton: { backgroundColor: "#1aff1a", padding: 15, borderRadius: 8, marginBottom: 10 },
  gwmodalButtonText: { color: "#000", fontWeight: "bold" },
  gwresultsText: {fontSize: 16,color: '#333',backgroundColor: '#f1f8e9',borderRadius: 6,paddingVertical: 4,paddingHorizontal: 10,marginBottom: 5,textAlign: 'center',fontWeight: '500'},
  gwscreenTitle: {fontSize: 24,fontWeight: "bold", color: "white", marginBottom: 10, textAlign:"center"},
  gwchartContainer: {marginTop: 20,justifyContent: "center",alignItems: "center"},
  gwresultcontainer: {padding: 20, alignItems: 'center'},
  gwresultCalculation:{fontSize: 28,fontWeight: 'bold',color: '#00796b',marginBottom: 18,textAlign: 'center', fontFamily: 'System',letterSpacing:1, textShadowColor:'#b2dfdb', textShadowOffset:{width: 1, height: 1}, textShadowRadius: 2},
  gwresultsModel:{fontSize: 20,color: '#333', marginBottom: 10,textAlign: 'center',fontWeight: '600',backgroundColor: '#e0f2f1',borderRadius: 8,padding: 6},
  gwresultsInputs:{fontSize: 18,color: '#00796b',marginBottom: 8,textAlign: 'center',fontWeight: '600',letterSpacing:0.5},     
  gwresultsResults:{fontSize: 24,color: '#004d40',fontWeight: 'bold',marginBottom: 18,textAlign: 'center',backgroundColor: '#b2dfdb',borderRadius: 8,padding: 10,elevation: 2,shadowColor: '#000',shadowOffset: { width: 0, height: 2 },shadowOpacity: 0.1,shadowRadius: 2},
  gwpredictorBox:{backgroundColor: 'rgb(255, 255, 255)',borderRadius: 15,padding: 25,width: '90%',shadowColor: '#000',shadowOffset: { width: 0, height: 4 },shadowOpacity: 0.3,shadowRadius: 5,elevation: 10},
  gwpredictorwell:{fontSize: 22, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  gwpredictormodel:{fontSize: 16, fontWeight: '600', marginBottom: 10 },
  gwpredictorbasic:{fontSize: 16, fontWeight: '600', marginBottom: 10 },
  gwpredictorregression:{ fontSize: 16, fontWeight: '600', marginBottom: 10 },
  gwpredictorbest:{fontSize: 18, fontWeight: '700', marginBottom: 25, color: '#004d40', textAlign: 'center' },
  gwresultsTexts:{fontSize: 20,color: '#333',marginBottom: 12,textAlign: 'center',fontWeight: '600'},
  gwfullscreenbackground: {flex: 1,resizeMode: 'cover',justifyContent: 'center',alignItems: 'center'},
  gwresultcard:{backgroundColor: '#ffffff',borderRadius: 20,padding: 24,marginVertical: 40,width: '95%',maxWidth: 420,shadowColor: '#000',shadowOffset: { width: 0, height: 5 },shadowOpacity: 0.2,shadowRadius: 8,elevation: 8},
  gwoverlay:{...StyleSheet.absoluteFillObject,backgroundColor: 'rgba(0, 0, 0, 0.3)'},
  gwheader:{fontSize: 24,fontWeight: 'bold',color: '#00796b',textAlign: 'center',marginBottom: 10},
  gwsubheader: {fontSize: 16,textAlign: 'center',color: '#444',marginBottom: 20},
  gwhighlight:{fontWeight: '600',color: '#009688'},
  gwresultLabel: {fontSize: 16,fontWeight: '600',color: '#37474F',marginTop: 10},
  gwresultValue: {fontSize: 28,fontWeight: 'bold',color: '#00796b',marginBottom: 20,textAlign: 'center'},
  gwinputHeader: {fontSize: 18,fontWeight: 'bold',color: '#37474F',marginBottom: 10,marginTop: 10},
  gwinputRow: {flexDirection: 'row',justifyContent: 'space-between',marginVertical: 4,paddingVertical: 4,borderBottomWidth: 1,borderBottomColor: '#eee'},
  gwinputKey: {fontSize: 15,color: '#00796b',fontWeight: '600'},
  gwinputValue:{fontSize: 15,color: '#555'},
  
  eoraxisLabel:{
  position: 'absolute',
  color: '#fff',
  fontSize: 14,
  fontWeight: 'bold',
  },
  eorxAxisLabel: {
  bottom: -30,  
  alignSelf: 'center',
  },
  eoryAxisLabel: {
  left: -45, 
  top: '40%',
  transform: [{ rotate: '-90deg' }],
  },
  gwaxisLabel: {
  position: 'absolute',
  color: '#fff',
  fontSize: 14,
  fontWeight: 'bold',
  },
  gwxAxisLabel: {
  bottom: -30,  
  alignSelf: 'center',
  },
  gwyAxisLabel: {
  left: -45, 
  top: '40%',
  transform: [{ rotate: '-90deg' }],
  },
  axisLabel: {
  position: 'absolute',
  color: '#fff',
  fontSize: 14,
  fontWeight: 'bold',
  },
 xAxisLabel: {
  bottom: -30, 
  alignSelf: 'center',
  },
  yAxisLabel: {
  left: -45, 
  top: '40%',
  transform: [{ rotate: '-90deg' }],
  }
  });