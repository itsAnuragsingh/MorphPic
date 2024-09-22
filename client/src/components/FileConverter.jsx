import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { Upload, Download, Image, AlertCircle, Moon, Sun, ChevronDown, Menu, X, Home, Star, Mail } from 'lucide-react'
import * as api from '../services/api'

export default function ImageConverterPro() {
  const [file, setFile] = useState(null)
  const [convertProgress, setConvertProgress] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [showFormatPopup, setShowFormatPopup] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState('')
  const [conversionComplete, setConversionComplete] = useState(false)
  const [convertedFilename, setConvertedFilename] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const fileInputRef = useRef(null)
  const controls = useAnimation()

  const supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'tiff', 'avif']

  useEffect(() => {
    controls.start({
      y: [0, -10, 0],
      transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
    })
  }, [controls])

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    handleNewFile(e.dataTransfer.files[0])
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleNewFile(e.target.files[0])
    }
  }

  const handleNewFile = (newFile) => {
    const fileExtension = newFile.name.split('.').pop().toLowerCase()
    if (newFile && fileExtension && supportedFormats.includes(fileExtension)) {
      setFile(newFile)
      setShowFormatPopup(true)
      setConversionComplete(false)
      setConvertedFilename(null)
      setConvertProgress(0)
      setError(null)
    } else {
      setError('Please select a supported image file (JPEG, PNG, WebP, TIFF, AVIF).')
    }
  }

  const handleConvert = async () => {
    setShowFormatPopup(false);
    setError(null);
    setConvertProgress(0);
  
    try {
      // Upload the file
      const uploadResponse = await api.uploadFile(file);
      setConvertProgress(33);
  
      // Convert the file
      const conversionResponse = await api.convertFile(uploadResponse.filename, selectedFormat);
      setConvertProgress(66);
  
      setConvertedFilename(conversionResponse.convertedFilename);
      setConversionComplete(true);
      setConvertProgress(100);
    } catch (err) {
      console.error('Conversion error:', err);
      setError(`Conversion failed: ${err.message || 'An unexpected error occurred'}. Please try again.`);
      setConvertProgress(0);
    }
  };

  const handleDownload = async () => {
    if (convertedFilename) {
      setIsDownloading(true);
      setError(null);
      try {
        const blob = await api.downloadFile(convertedFilename);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `converted_image.${selectedFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        // Delete files after successful download
        await api.deleteFiles(file.name, convertedFilename);
        
        // Reset state
        setFile(null);
        setConvertedFilename(null);
        setConversionComplete(false);
      } catch (err) {
        console.error('Download error:', err);
        setError(`Download failed: ${err.message || 'An unexpected error occurred'}. Please try again.`);
      } finally {
        setIsDownloading(false);
      }
    }
  };
  const handleRetry = () => {
    setError(null)
    setConvertProgress(0)
    setShowFormatPopup(true)
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const navItems = [
    { name: 'Home', icon: Home },
    { name: 'Features', icon: Star },
    { name: 'Contact', icon: Mail },
  ]

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-100 text-gray-900' : 'bg-gray-900 text-white'} transition-colors duration-300`}>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 backdrop-filter backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Morphify
              </span>
            </motion.div>
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <motion.a
                  key={item.name}
                  href="#"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-800 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 flex items-center space-x-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </motion.a>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-700 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </motion.button>
              <div className="md:hidden">
                <motion.button
                  onClick={toggleMenu}
                  className="p-2 rounded-md hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="md:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href="#"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-800 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.h1 
            className="text-4xl md:text-6xl font-extrabold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Transform Your Images
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl mb-12 text-center text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Effortlessly convert your images to any format with our cutting-edge technology
          </motion.p>

          <motion.div 
            className={`bg-white dark:bg-gray-800 rounded-3xl p-8 mb-12 shadow-2xl ${
              darkMode ? 'shadow-purple-500/20' : 'shadow-purple-500/10'
            } transition-all duration-300`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <motion.div
              className={`border-4 border-dashed rounded-2xl p-12 text-center cursor-pointer ${
                isDragging 
                  ? 'border-purple-500 bg-purple-100 dark:bg-purple-900' 
                  : 'border-gray-300 dark:border-gray-700'
              } transition-colors duration-300`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div animate={controls}>
                <Upload className="mx-auto mb-6 text-purple-500" size={64} />
              </motion.div>
              <p className="text-2xl font-semibold mb-2">Drag & Drop your image here</p>
              <p className="mb-6 text-gray-500 dark:text-gray-400">or</p>
              <motion.button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Choose file
              </motion.button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                className="hidden"
                accept=".jpeg,.jpg,.png,.webp,.tiff,.avif"
              />
              <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">Supported formats: JPEG, PNG, WebP, TIFF, AVIF</p>
            </motion.div>

            <AnimatePresence>
              {file && (
                <motion.div 
                  className="mt-8 bg-gray-100 dark:bg-gray-700 rounded-xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 className="text-2xl font-bold mb-4 text-purple-600 dark:text-purple-400">Selected File:</h2>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center text-gray-700 dark:text-gray-300">
                      <Image className="mr-3 text-purple-500" />
                      {file.name}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showFormatPopup && (
                <motion.div 
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-filter backdrop-blur-sm z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div 
                    className="bg-white dark:bg-gray-800 p-8 rounded-2xl w-full max-w-md shadow-2xl"
                    initial={{ scale: 0.9, y: 20, rotateX: 45 }}
                    animate={{ scale: 1, y: 0, rotateX: 0 }}
                    exit={{ scale: 0.9, y: 20, rotateX: 45 }}
                    transition={{ type: "spring", damping: 15 }}
                  >
                    <h3 className="text-2xl font-bold mb-6 text-center text-purple-600 dark:text-purple-400">Choose Output Format</h3>
                    <div className="relative mb-6">
                      <select 
                        value={selectedFormat} 
                        onChange={(e) => setSelectedFormat(e.target.value)}
                        className="block w-full p-4 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select format</option>
                        {supportedFormats.map(format => (
                          <option key={format} value={format}>{format.toUpperCase()}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
                    </div>
                    <motion.button
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleConvert}
                      disabled={!selectedFormat}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Convert Now
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {convertProgress > 0 && convertProgress < 100 && (
                <motion.div 
                  className="mt-8 bg-gray-100 dark:bg-gray-700 rounded-xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h3 className="text-xl font-bold mb-4 text-purple-600 dark:text-purple-400">Converting...</h3>
                  <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-4 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${convertProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <p className="text-right mt-2 text-gray-600 dark:text-gray-400">{convertProgress.toFixed(0)}%</p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {conversionComplete && convertedFilename && (
                <motion.div 
                  className="mt-8 bg-gray-100 dark:bg-gray-700 rounded-xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h3 className="text-2xl font-bold mb-4 text-purple-600 dark:text-purple-400">Conversion Complete!</h3>
                  <motion.button
                    onClick={handleDownload}
                    disabled={isDownloading || !convertedFilename}
                    className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-green-500 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="mr-2 h-5 w-5" /> {isDownloading ? 'Downloading...' : 'Download'}
                  </motion.button>
                  {error && <p className="text-red-500">{error}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                className="mt-8 p-6 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center mb-3">
                  <AlertCircle className="mr-2 h-6 w-6 text-red-500 dark:text-red-400" />
                  <h3 className="text-xl font-bold">Error</h3>
                </div>
                <p className="mb-4">{error}</p>
                <motion.button
                  onClick={handleRetry}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Try Again
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
