import { useState } from 'react';
import './App.css';
import {Routes, Route} from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
      <main className = 'main-content'>
        <Routes>
          <Route path="/" element = {<Home/>}/>
        </Routes>

      </main>
  )

}
export default App
