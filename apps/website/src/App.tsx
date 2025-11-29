import { StickerOverview } from './components/StickerOverview'

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <div className="bg-gray-900 text-white text-xs py-2 text-center font-medium tracking-wide">
        ❤️ We sell high-quality unique stickers &nbsp;|&nbsp; 📦 Free worldwide shipping
      </div>

      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="https://ik.imagekit.io/pyodstickers/img/pyod-white-nolaptop.png" alt="Pimp Your Own Device" className="h-12" />
          </div>
          <nav className="hidden md:block">
            <ul className="flex space-x-8 text-gray-800 font-bold uppercase text-sm tracking-wider">
              <li><a href="#" className="hover:text-pink-600 transition-colors">Stickers</a></li>
              <li><a href="#" className="hover:text-pink-600 transition-colors">News</a></li>
              <li><a href="#" className="hover:text-pink-600 transition-colors">Our Mission</a></li>
              <li><a href="#" className="hover:text-pink-600 transition-colors">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <div className="bg-gray-900 text-white py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://pimpyourowndevice.com/dist/img/bg-mac.jpg')] bg-cover bg-center"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Make your laptop <span className="text-pink-500">even more yours</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              We provide you with unique dev and tech stickers to pimp up your own devices so that your laptop stands out.
            </p>
            <button className="bg-pink-600 text-white font-bold py-3 px-8 rounded-full hover:bg-pink-700 transition-transform transform hover:scale-105 shadow-lg">
              Browse Collection
            </button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-gray-200 pb-4">
            <div>
              <h3 className="text-3xl font-bold text-gray-900">Our Stickers</h3>
              <p className="text-gray-500 mt-2">Find the perfect sticker for your stack</p>
            </div>
          </div>

          <StickerOverview min={0} imageHeight={240} />
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <img src="https://ik.imagekit.io/pyodstickers/img/pyod-white-nolaptop.png" alt="PYOD" className="h-10 mb-6" style={{ filter: "brightness(5)" }} />
              <p className="text-sm leading-relaxed mb-6 max-w-md">
                Do you think your laptop is a bit boring? We're here to provide you with unique dev and tech stickers to pimp up your own devices.
              </p>
              <div className="flex space-x-4">
                <span className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors cursor-pointer">🐦</span>
                <span className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors cursor-pointer">📸</span>
                <span className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors cursor-pointer">💼</span>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Navigate</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-pink-500 transition-colors">Stickers</a></li>
                <li><a href="#" className="hover:text-pink-500 transition-colors">News</a></li>
                <li><a href="#" className="hover:text-pink-500 transition-colors">Our Mission</a></li>
                <li><a href="#" className="hover:text-pink-500 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">Our Policies</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-pink-500 transition-colors">Shipping</a></li>
                <li><a href="#" className="hover:text-pink-500 transition-colors">Returns</a></li>
                <li><a href="#" className="hover:text-pink-500 transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-xs text-gray-500">
            <p className="mb-2">© PIMP YOUR OWN DEVICE - PROVIDED WITH ♥ BY LUISE FREESE AND ELIO STRUYF</p>
            <p>POWERED BY #POWERAUTOMATE</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
