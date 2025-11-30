#!/bin/bash
# Визначення ОС
OS_TYPE=""
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS_TYPE="linux"
    echo "OS: Linux detected"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS_TYPE="macos"
    echo "OS: macOS detected"
else
    echo "Error: Unsupported operating system"
    exit 1
fi

# Функція для встановлення на Linux
install_linux() {
    echo "1. Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    
    echo "2. Installing Python..."
    if ! command -v python3 &> /dev/null; then
        sudo apt install -y python3 python3-pip python3-venv
    else
        echo "   - Python3 is already installed ✓"
    fi
    
    echo "3. Installing Node.js..."
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt install -y nodejs
    else
        echo "   - Node.js is already installed ✓"
    fi
}

# Function to install on macOS
install_macos() {
    # Checking Homebrew
    if ! command -v brew &> /dev/null; then
        echo "1. Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    else
        echo "1. Homebrew is already installed ✓"
    fi
    
    echo "2. Installing Python..."
    if ! command -v python3 &> /dev/null; then
        brew install python
    else
        echo "   - Python is already installed ✓"
    fi
    
    echo "3. Installing Node.js..."
    if ! command -v node &> /dev/null; then
        brew install node
    else
        echo "   - Node.js is already installed ✓"
    fi
}

# Calling the appropriate installation function
if [ "$OS_TYPE" = "linux" ]; then
    install_linux
elif [ "$OS_TYPE" = "macos" ]; then
    install_macos
fi

echo
echo "4. Installing dependencies and starting the application..."
echo

# Function to open a new terminal and run a command
open_terminal() {
    local command="$1"
    local title="$2"
    
    if [ "$OS_TYPE" = "macos" ]; then
        osascript -e "tell app \"Terminal\" to do script \"$command\""
    elif [ "$OS_TYPE" = "linux" ]; then
        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal -- bash -c "$command; exec bash"
        elif command -v konsole &> /dev/null; then
            konsole -e bash -c "$command; exec bash"
        elif command -v xterm &> /dev/null; then
            xterm -e bash -c "$command; exec bash"
        else
            echo "   Warning: No supported terminal found. Please run the command manually:"
            echo "   $command"
        fi
    fi
}

# Starting Python service
echo "   - Starting Python service..."
cd python-service
python3 -m venv .venv
source .venv/bin/activate
pip3 install -r requirements.txt
open_terminal "cd '$PWD' && source .venv/bin/activate && uvicorn app:app --host 127.0.0.1 --port 8000 --reload" "Python Service"

# Starting server
echo "   - Starting server..."
cd ../server
npm install
open_terminal "cd '$PWD' && node server.js" "Server"

# Starting client
echo "   - Starting client..."
cd ../client
npm install
open_terminal "cd '$PWD' && npm run dev" "Client"

echo
echo "   The application is starting!"
echo "   Please check the open terminal windows."
echo

# User instructions
echo "Instructions:"
echo "1. Wait for 3 terminal windows to open"
echo "2. Open your browser and go to: http://localhost:3000"
echo "3. To stop the application - close all 3 terminal windows"
echo