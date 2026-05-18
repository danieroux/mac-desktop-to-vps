{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }@inputs:

    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
      rec {
        formatter = pkgs.nixpkgs-fmt;

        devShells.default = pkgs.mkShellNoCC {

          packages = [
            pkgs.nodejs
            pkgs.just
          ];
        };
      }
    );
}
